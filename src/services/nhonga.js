// Serviço para integração com vendorapay.com
const VENDORAPAY_API_BASE = 'https://vendorapay.com/api'
const API_KEY = '03gdpgmaoh6o46m7pqg3v8d6ggecik8p68dyou7zvvwvr8qjclms5mprowv9'
const WEBHOOK_SECRET = 'hmthkoukhk5z47jul0nvys68h9ihyglykt43iokjtck0sn6nx37ghkd3qwlr5emo8zrx73nxbrmuvw0xukb8qidque9ztz7ru9uys2srvh8sc0ihukn0wsd0'

// Configurações padrão
const DEFAULT_CONFIG = {
  currency: 'MZN',
  environment: 'prod'
}

/**
 * Criar uma transação de pagamento
 * @param {Object} paymentData - Dados do pagamento
 * @param {number} paymentData.amount - Valor em centavos
 * @param {string} paymentData.context - Descrição do pagamento
 * @param {string} paymentData.callbackUrl - URL do webhook
 * @param {string} paymentData.returnUrl - URL de retorno
 * @param {string} [paymentData.currency='MZN'] - Moeda
 * @param {string} [paymentData.environment='prod'] - Ambiente
 * @returns {Promise<Object>} Resposta da API
 */
export const createPayment = async (paymentData) => {
  try {
    const payload = {
      amount: paymentData.amount,
      context: paymentData.context,
      callbackUrl: paymentData.callbackUrl,
      returnUrl: paymentData.returnUrl,
      currency: paymentData.currency || DEFAULT_CONFIG.currency,
      environment: paymentData.environment || DEFAULT_CONFIG.environment,
      // Adicionar metadados do usuário se disponível
      ...(paymentData.userId && { userId: paymentData.userId }),
      ...(paymentData.userEmail && { userEmail: paymentData.userEmail })
    }

    const response = await fetch(`${VENDORAPAY_API_BASE}/payment/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apiKey': API_KEY
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error || 'Erro ao criar pagamento')
    }

    return {
      success: true,
      redirectUrl: data.redirectUrl,
      transactionId: data.id,
      data: data
    }
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
 * @param {string} transactionId - ID da transação
 * @returns {Promise<Object>} Status da transação
 */
export const getTransactionStatus = async (transactionId) => {
  try {
    const response = await fetch(`${VENDORAPAY_API_BASE}/payment/status/${transactionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'X-API-Key': API_KEY
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      success: true,
      status: data.status,
      data: data
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
 * Processar webhook de pagamento
 * @param {Object} webhookData - Dados do webhook
 * @returns {Object} Resultado do processamento
 */
export const processWebhook = (webhookData) => {
  try {
    const {
      transactionId,
      status,
      amount,
      currency,
      context,
      timestamp
    } = webhookData

    // Verificar se o pagamento foi aprovado
    const isApproved = status === 'approved' || status === 'completed'
    
    return {
      success: true,
      transactionId,
      status,
      amount,
      currency,
      context,
      timestamp,
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
 * @param {number} amount - Valor em centavos
 * @param {string} currency - Moeda
 * @returns {string} Valor formatado
 */
export const formatAmount = (amount, currency = 'MZN') => {
  // Se o valor for menor que 1000, assume que já está em unidades
  const value = amount < 1000 ? amount : amount / 100
  return new Intl.NumberFormat('pt-MZ', {
    style: 'currency',
    currency: currency
  }).format(value)
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
    const existingTransactions = JSON.parse(localStorage.getItem('vendorapay_transactions') || '{}')
    existingTransactions[transactionId] = transactionData
    localStorage.setItem('vendorapay_transactions', JSON.stringify(existingTransactions))
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
      const existingTransactions = JSON.parse(localStorage.getItem('vendorapay_transactions') || '{}')
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
    const existingTransactions = JSON.parse(localStorage.getItem('vendorapay_transactions') || '{}')
    delete existingTransactions[transactionId]
    localStorage.setItem('vendorapay_transactions', JSON.stringify(existingTransactions))
  } catch (error) {
    console.error('Erro ao limpar transação do localStorage:', error)
  }
}

/**
 * Limpar transações antigas (mais de 1 hora)
 */
export const clearOldTransactions = () => {
  try {
    const existingTransactions = JSON.parse(localStorage.getItem('vendorapay_transactions') || '{}')
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
      localStorage.setItem('vendorapay_transactions', JSON.stringify(existingTransactions))
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
