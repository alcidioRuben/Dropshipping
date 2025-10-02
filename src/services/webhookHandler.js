// Handler para webhooks da Nhonga.net
import { processWebhook, verifyWebhookSignature } from ../services/vendorapay.js'
import { updateUserProfile } from '../contexts/AuthContext.jsx'

/**
 * Processar webhook de pagamento da Nhonga.net
 * @param {Object} webhookData - Dados do webhook
 * @param {string} signature - Assinatura do webhook
 * @returns {Object} Resultado do processamento
 */
export const handleNhongaWebhook = async (webhookData, signature) => {
  try {
    // Verificar assinatura do webhook
    const isValidSignature = verifyWebhookSignature(
      JSON.stringify(webhookData), 
      signature
    )
    
    if (!isValidSignature) {
      console.error('Assinatura do webhook inválida')
      return {
        success: false,
        error: 'Assinatura inválida'
      }
    }

    // Processar dados do webhook
    const result = processWebhook(webhookData)
    
    if (!result.success) {
      console.error('Erro ao processar webhook:', result.error)
      return result
    }

    // Se o pagamento foi aprovado, atualizar status do usuário
    if (result.isApproved) {
      try {
        // Aqui você pode implementar a lógica para atualizar o usuário
        // Por exemplo, marcar como pago no banco de dados
        console.log('Pagamento aprovado:', {
          transactionId: result.transactionId,
          amount: result.amount,
          currency: result.currency,
          context: result.context
        })

        // TODO: Implementar atualização do usuário no banco de dados
        // await updateUserPaymentStatus(result.transactionId, result.amount)
        
        return {
          success: true,
          message: 'Webhook processado com sucesso',
          data: result
        }
      } catch (updateError) {
        console.error('Erro ao atualizar status do usuário:', updateError)
        return {
          success: false,
          error: 'Erro ao atualizar status do usuário'
        }
      }
    }

    return {
      success: true,
      message: 'Webhook processado (pagamento não aprovado)',
      data: result
    }
  } catch (error) {
    console.error('Erro ao processar webhook:', error)
    return {
      success: false,
      error: error.message || 'Erro desconhecido ao processar webhook'
    }
  }
}

/**
 * Simular processamento de webhook para desenvolvimento
 * @param {Object} webhookData - Dados do webhook
 * @returns {Object} Resultado do processamento
 */
export const simulateWebhook = (webhookData) => {
  console.log('Simulando webhook:', webhookData)
  
  return {
    success: true,
    message: 'Webhook simulado com sucesso',
    data: {
      transactionId: webhookData.transactionId || 'sim_' + Date.now(),
      status: 'approved',
             amount: webhookData.amount || 300,
      currency: 'MZN',
      context: webhookData.context || 'Curso de Dropshipping',
      timestamp: new Date().toISOString(),
      isApproved: true
    }
  }
}

export default {
  handleNhongaWebhook,
  simulateWebhook
}
