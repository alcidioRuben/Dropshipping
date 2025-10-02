// Webhook handler para vendorapay.com
import { processWebhook, verifyWebhookSignature, getTransactionUser, clearTransactionUser } from '../services/vendorapay'
import { updatePaymentFromWebhook } from '../contexts/AuthContext'

/**
 * Handler para webhooks da vendorapay.com
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const vendorapayWebhook = async (req, res) => {
  try {
    // Verificar método HTTP
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    // Obter dados do webhook
    const webhookData = req.body
    const signature = req.headers['x-vendorapay-signature'] || req.headers['x-signature']

    console.log('Webhook recebido:', {
      data: webhookData,
      signature: signature,
      headers: req.headers
    })

    // Verificar assinatura (opcional para desenvolvimento)
    if (signature && !verifyWebhookSignature(JSON.stringify(webhookData), signature)) {
      console.error('Assinatura inválida do webhook')
      return res.status(401).json({ error: 'Invalid signature' })
    }

    // Processar webhook
    const result = processWebhook(webhookData)

    if (!result.success) {
      console.error('Erro ao processar webhook:', result.error)
      return res.status(400).json({ error: result.error })
    }

    // Se o pagamento foi aprovado, atualizar status do usuário
    if (result.isApproved) {
      console.log('Pagamento aprovado:', {
        transactionId: result.transactionId,
        amount: result.amount,
        currency: result.currency,
        context: result.context
      })

      // Atualizar status do usuário no Firebase
      try {
        // Tentar obter usuário do mapeamento de transações
        const transactionUser = getTransactionUser(result.transactionId)
        
        // Fallback: tentar extrair UID do webhook (se vendorapay.com enviar)
        const userId = transactionUser?.userId || webhookData.userId || webhookData.uid
        
        if (userId) {
          const paymentData = {
            amount: result.amount,
            transactionId: result.transactionId,
            currency: result.currency,
            context: result.context
          }
          
          await updatePaymentFromWebhook(userId, paymentData)
          console.log('✅ Status do usuário atualizado no Firebase:', {
            userId,
            transactionId: result.transactionId,
            amount: result.amount
          })
          
          // Limpar mapeamento após processamento
          clearTransactionUser(result.transactionId)
        } else {
          console.log('⚠️ UID do usuário não encontrado:', {
            transactionId: result.transactionId,
            webhookData: webhookData,
            transactionUser: transactionUser
          })
        }
      } catch (updateError) {
        console.error('❌ Erro ao atualizar status do usuário:', updateError)
      }

      // Aqui você pode implementar adicionalmente:
      // 1. Enviar email de confirmação
      // 2. Ativar acesso ao curso
      // 3. Registrar a transação no banco de dados
      // 4. Notificar o usuário sobre o pagamento aprovado
      
      // Log para debug
      console.log('✅ Pagamento processado com sucesso:', {
        transactionId: result.transactionId,
        amount: result.amount,
        currency: result.currency,
        timestamp: new Date().toISOString()
      })
    } else {
      console.log('⚠️ Pagamento não aprovado:', {
        transactionId: result.transactionId,
        status: result.status,
        amount: result.amount
      })
    }

    // Responder com sucesso
    res.status(200).json({ 
      success: true, 
      message: 'Webhook processed successfully',
      transactionId: result.transactionId
    })

  } catch (error) {
    console.error('Erro no webhook:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    })
  }
}

/**
 * Handler para verificar status de pagamento
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const checkPaymentStatus = async (req, res) => {
  try {
    const { transactionId, userId } = req.query

    if (!transactionId) {
      return res.status(400).json({ error: 'Transaction ID is required' })
    }

    // Verificar status na API do vendorapay.com
    try {
      const { getTransactionStatus } = await import('../services/vendorapay')
      const statusResult = await getTransactionStatus(transactionId)
      
      if (statusResult.success) {
        res.status(200).json({
          success: true,
          transactionId,
          status: statusResult.status,
          data: statusResult.data,
          message: 'Payment status retrieved from vendorapay.com'
        })
      } else {
        res.status(400).json({
          success: false,
          error: statusResult.error,
          message: 'Failed to retrieve payment status'
        })
      }
    } catch (apiError) {
      console.error('Erro ao consultar API vendorapay.com:', apiError)
      res.status(500).json({
        success: false,
        error: 'Failed to check payment status with vendorapay.com',
        message: apiError.message
      })
    }

  } catch (error) {
    console.error('Erro ao verificar status:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    })
  }
}

/**
 * Handler para verificar transações pendentes do usuário
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const checkUserPendingTransactions = async (req, res) => {
  try {
    const { userId } = req.query

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' })
    }

    // Verificar transações pendentes do usuário
    try {
      const { getTransactionUser } = await import('../services/vendorapay')
      
      // Buscar todas as transações do localStorage
      const existingTransactions = JSON.parse(localStorage.getItem('vendorapay_transactions') || '{}')
      const userTransactions = Object.entries(existingTransactions).filter(
        ([_, data]) => data.userId === userId
      )
      
      res.status(200).json({
        success: true,
        userId,
        pendingTransactions: userTransactions.map(([id, data]) => ({
          transactionId: id,
          ...data
        })),
        message: 'User pending transactions retrieved'
      })
    } catch (error) {
      console.error('Erro ao buscar transações do usuário:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve user transactions',
        message: error.message
      })
    }

  } catch (error) {
    console.error('Erro ao verificar transações do usuário:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    })
  }
}

export default {
  vendorapayWebhook,
  checkPaymentStatus,
  checkUserPendingTransactions
}
