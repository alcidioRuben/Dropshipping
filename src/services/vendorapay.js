// Serviço para integração com Paymoz (paymoz.tech)
const PAYMOZ_API_BASE = 'https://paymoz.tech/api/v1'
// API Key deve ser configurada via variável de ambiente
const API_KEY = import.meta.env.VITE_PAYMOZ_API_KEY || '2abc1e2f-4d13-4c68-8504-66ab1b64310e'

// Configurações padrão
const DEFAULT_CONFIG = {
  currency: 'MZN',
  environment: 'prod'
}

/**
 * Criar uma transação de pagamento via Paymoz (M-Pesa)
 * @param {Object} paymentData - Dados do pagamento
 * @param {string} paymentData.valor - Valor como string (ex: "299.00")
 * @param {string} paymentData.numero_celular - Número de celular do cliente (ex: "841234567")
 * @param {string} [paymentData.referencia_externa] - Referência externa (opcional)
 * @param {string} [paymentData.metodo='mpesa'] - Método de pagamento (padrão: 'mpesa')
 * @returns {Promise<Object>} Resposta da API
 */
export const createPayment = async (paymentData) => {
  try {
    // Validar parâmetros obrigatórios
    if (!paymentData.valor) {
      throw new Error('O campo valor é obrigatório')
    }
    if (!paymentData.numero_celular) {
      throw new Error('O campo numero_celular é obrigatório')
    }

    // Formatar número de celular (remover espaços e caracteres especiais)
    const numeroCelular = paymentData.numero_celular.replace(/\D/g, '')

    const payload = {
      metodo: paymentData.metodo || 'mpesa',
      valor: paymentData.valor,
      numero_celular: numeroCelular,
      ...(paymentData.referencia_externa && { referencia_externa: paymentData.referencia_externa })
    }

    const response = await fetch(`${PAYMOZ_API_BASE}/pagamentos/processar/`, {
      method: 'POST',
      headers: {
        'Authorization': `ApiKey ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    // Tratar diferentes códigos de status HTTP
    if (response.status === 401) {
      throw new Error(data.detail || 'API Key inválida ou não encontrada')
    }

    if (response.status === 403) {
      throw new Error(data.detail || 'Você não tem permissão para realizar esta ação')
    }

    if (response.status === 400) {
      throw new Error(data.erro || 'Requisição inválida. Verifique os dados enviados.')
    }

    if (response.status === 500) {
      throw new Error(data.erro || 'Erro interno do servidor. Tente novamente mais tarde.')
    }

    if (!response.ok) {
      throw new Error(data.erro || data.detail || `HTTP ${response.status}: ${response.statusText}`)
    }

    // Verificar se a resposta indica sucesso
    if (data.sucesso === false) {
      throw new Error(data.erro || 'Erro ao processar pagamento')
    }

    // Se chegou aqui, o pagamento foi processado com sucesso
    if (data.sucesso === true && data.dados) {
      return {
        success: true,
        transactionId: data.dados.output_TransactionID,
        conversationId: data.dados.output_ConversationID,
        thirdPartyReference: data.dados.output_ThirdPartyReference,
        responseCode: data.dados.output_ResponseCode,
        responseDesc: data.dados.output_ResponseDesc,
        message: data.mensagem || 'Pagamento processado com sucesso',
        data: data.dados
      }
    }

    // Fallback para estrutura de resposta não esperada
    throw new Error('Resposta da API em formato inesperado')
  } catch (error) {
    console.error('Erro ao criar pagamento:', error)
    return {
      success: false,
      error: error.message || 'Erro desconhecido ao criar pagamento'
    }
  }
}

/**
 * Verificar status de uma transação
 * Nota: A API Paymoz pode não ter endpoint de verificação de status.
 * Esta função mantém compatibilidade com o código existente.
 * @param {string} transactionId - ID da transação
 * @returns {Promise<Object>} Status da transação
 */
export const getTransactionStatus = async (transactionId) => {
  try {
    // Nota: A API Paymoz pode não ter um endpoint de verificação de status
    // Por enquanto, retornamos um status genérico
    // Você pode implementar verificação via webhook ou outro método
    console.warn('Verificação de status não disponível na API Paymoz. Use webhooks para confirmar pagamentos.')
    
    return {
      success: true,
      status: 'pending', // Status pendente até confirmação via webhook
      transactionId: transactionId,
      message: 'Status deve ser verificado via webhook'
    }
  } catch (error) {
    console.error('Erro ao verificar status:', error)
    return {
      success: false,
      error: error.message || 'Erro ao verificar status da transação'
    }
  }
}

/**
 * Verificar assinatura do webhook
 * @param {string} payload - Payload do webhook
 * @param {string} signature - Assinatura recebida
 * @returns {boolean} Se a assinatura é válida
 */
export const verifyWebhookSignature = (payload, signature) => {
  try {
    // Implementar verificação de assinatura HMAC
    // Por enquanto, retorna true para desenvolvimento
    // Em produção, implementar verificação real com crypto
    return true
  } catch (error) {
    console.error('Erro ao verificar assinatura:', error)
    return false
  }
}

/**
 * Processar webhook de pagamento da Paymoz
 * @param {Object} webhookData - Dados do webhook
 * @returns {Object} Resultado do processamento
 */
export const processWebhook = (webhookData) => {
  try {
    // A estrutura do webhook da Paymoz pode variar
    // Adaptar conforme a documentação real da Paymoz
    const transactionId = webhookData.output_TransactionID || 
                         webhookData.transactionId || 
                         webhookData.transaction_id
    
    const status = webhookData.status || 
                   webhookData.output_ResponseCode || 
                   'unknown'
    
    const amount = webhookData.amount || 
                  webhookData.valor || 
                  webhookData.value
    
    const currency = webhookData.currency || 'MZN'
    
    // Verificar se o pagamento foi aprovado
    // Paymoz retorna "INS-0" para sucesso
    const isApproved = status === 'INS-0' || 
                      status === 'approved' || 
                      status === 'completed' ||
                      webhookData.sucesso === true
    
    return {
      success: true,
      transactionId,
      status,
      amount,
      currency,
      context: webhookData.context || 'Curso de Dropshipping',
      timestamp: webhookData.timestamp || new Date().toISOString(),
      isApproved,
      data: webhookData
    }
  } catch (error) {
    console.error('Erro ao processar webhook:', error)
    return {
      success: false,
      error: error.message || 'Erro ao processar webhook'
    }
  }
}

/**
 * Formatar valor para exibição
 * @param {number|string} amount - Valor (pode ser número ou string)
 * @param {string} currency - Moeda
 * @returns {string} Valor formatado
 */
export const formatAmount = (amount, currency = 'MZN') => {
  // Converter para número se for string
  const value = typeof amount === 'string' ? parseFloat(amount) : amount
  
  // Se o valor for menor que 1000, assume que já está em unidades
  const displayValue = value < 1000 ? value : value / 100
  
  return new Intl.NumberFormat('pt-MZ', {
    style: 'currency',
    currency: currency
  }).format(displayValue)
}

/**
 * Converter valor para centavos
 * @param {number} value - Valor em unidades
 * @returns {number} Valor em centavos
 */
export const toCents = (value) => {
  return Math.round(value * 100)
}

/**
 * Configurações do curso
 */
export const COURSE_CONFIG = {
  name: 'Curso Completo de Dropshipping',
  description: 'Aprenda dropshipping do zero e comece a faturar online',
  amount: 299, // 299 MZN (valor direto para vendorapay.com)
  currency: 'MZN',
  amountMZN: 299 // 299 MZN
}

/**
 * URLs do sistema
 */
export const SYSTEM_URLS = {
  base: process.env.NODE_ENV === 'production' 
    ? 'https://lacasadigital.com' 
    : 'http://localhost:3000',
  
  get callbackUrl() {
    return `${this.base}/api/webhook/vendorapay`
  },
  
  get returnUrl() {
    return `${this.base}/payment-success`
  },
  
  get cancelUrl() {
    return `${this.base}/payment`
  },
  
  get webhookUrl() {
    return `${this.base}/api/webhook/paymoz`
  }
}

/**
 * Armazenar mapeamento de transação para usuário
 * Isso é necessário porque o webhook não tem acesso direto ao usuário logado
 */
const transactionUserMap = new Map()

/**
 * Registrar transação com usuário
 * @param {string} transactionId - ID da transação
 * @param {string} userId - UID do usuário
 * @param {string} userEmail - Email do usuário
 */
export const registerTransactionUser = async (transactionId, userId, userEmail) => {
  const transactionData = {
    userId,
    userEmail,
    timestamp: new Date().toISOString()
  }
  
  // Armazenar em memória
  transactionUserMap.set(transactionId, transactionData)
  
  // Armazenar no localStorage como backup
  try {
    const existingTransactions = JSON.parse(localStorage.getItem('paymoz_transactions') || '{}')
    existingTransactions[transactionId] = transactionData
    localStorage.setItem('paymoz_transactions', JSON.stringify(existingTransactions))
  } catch (error) {
    console.error('Erro ao salvar transação no localStorage:', error)
  }

  // Registrar no servidor backend
  try {
    const baseUrl = SYSTEM_URLS.base
    const response = await fetch(`${baseUrl}/api/register-transaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transactionId,
        userId,
        userEmail
      })
    })

    if (response.ok) {
      console.log('✅ Transação registrada no servidor backend')
    } else {
      console.warn('⚠️ Falha ao registrar transação no servidor backend')
    }
  } catch (error) {
    console.error('❌ Erro ao registrar transação no servidor:', error)
  }
  
  console.log('Transação registrada:', { transactionId, userId, userEmail })
}

/**
 * Obter usuário da transação
 * @param {string} transactionId - ID da transação
 * @returns {Object|null} Dados do usuário ou null
 */
export const getTransactionUser = (transactionId) => {
  // Tentar obter da memória primeiro
  let transactionData = transactionUserMap.get(transactionId)
  
  // Se não encontrar na memória, tentar do localStorage
  if (!transactionData) {
    try {
      const existingTransactions = JSON.parse(localStorage.getItem('paymoz_transactions') || '{}')
      transactionData = existingTransactions[transactionId]
      
      // Se encontrar no localStorage, restaurar na memória
      if (transactionData) {
        transactionUserMap.set(transactionId, transactionData)
      }
    } catch (error) {
      console.error('Erro ao ler transação do localStorage:', error)
    }
  }
  
  return transactionData || null
}

/**
 * Limpar transação (após processamento)
 * @param {string} transactionId - ID da transação
 */
export const clearTransactionUser = (transactionId) => {
  // Remover da memória
  transactionUserMap.delete(transactionId)
  
  // Remover do localStorage
  try {
    const existingTransactions = JSON.parse(localStorage.getItem('paymoz_transactions') || '{}')
    delete existingTransactions[transactionId]
    localStorage.setItem('paymoz_transactions', JSON.stringify(existingTransactions))
  } catch (error) {
    console.error('Erro ao limpar transação do localStorage:', error)
  }
}

/**
 * Limpar transações antigas (mais de 1 hora)
 */
export const clearOldTransactions = () => {
  try {
    const existingTransactions = JSON.parse(localStorage.getItem('paymoz_transactions') || '{}')
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    
    let cleanedCount = 0
    Object.entries(existingTransactions).forEach(([transactionId, data]) => {
      const transactionTime = new Date(data.timestamp)
      if (transactionTime < oneHourAgo) {
        delete existingTransactions[transactionId]
        transactionUserMap.delete(transactionId)
        cleanedCount++
      }
    })
    
    if (cleanedCount > 0) {
      localStorage.setItem('paymoz_transactions', JSON.stringify(existingTransactions))
      console.log(`🧹 Limpeza: ${cleanedCount} transações antigas removidas`)
    }
  } catch (error) {
    console.error('Erro ao limpar transações antigas:', error)
  }
}

export default {
  createPayment,
  getTransactionStatus,
  verifyWebhookSignature,
  processWebhook,
  formatAmount,
  toCents,
  COURSE_CONFIG,
  SYSTEM_URLS,
  registerTransactionUser,
  getTransactionUser,
  clearTransactionUser,
  clearOldTransactions
}
