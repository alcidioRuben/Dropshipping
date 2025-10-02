const express = require('express');
const cors = require('cors');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, updateDoc } = require('firebase/firestore');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCMQ7OT56AOyP6zZpN1zWSzN4-yejrPrWs",
  authDomain: "lacasadigital-8b078.firebaseapp.com",
  projectId: "lacasadigital-8b078",
  storageBucket: "lacasadigital-8b078.firebasestorage.app",
  messagingSenderId: "979951106794",
  appId: "1:979951106794:web:fd31c401edec8008e13593",
  measurementId: "G-R5MP581P9Q"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// Mapeamento de transações para usuários (em memória)
const transactionUserMap = new Map();

// Função para registrar transação com usuário
const registerTransactionUser = (transactionId, userId, userEmail) => {
  const transactionData = {
    userId,
    userEmail,
    timestamp: new Date().toISOString()
  };
  
  transactionUserMap.set(transactionId, transactionData);
  console.log('Transação registrada:', { transactionId, userId, userEmail });
};

// Função para obter usuário da transação
const getTransactionUser = (transactionId) => {
  return transactionUserMap.get(transactionId) || null;
};

// Função para limpar transação
const clearTransactionUser = (transactionId) => {
  transactionUserMap.delete(transactionId);
};

// Função para verificar assinatura do webhook
const verifyWebhookSignature = (payload, signature) => {
  // Para desenvolvimento, sempre retorna true
  // Em produção, implementar verificação HMAC real
  return true;
};

// Função para processar webhook
const processWebhook = (webhookData) => {
  try {
    const {
      transactionId,
      status,
      amount,
      currency,
      context,
      timestamp
    } = webhookData;

    const isApproved = status === 'approved' || status === 'completed';
    
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
    };
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    return {
      success: false,
      error: error.message || 'Erro ao processar webhook'
    };
  }
};

// Função para atualizar status de pagamento no Firebase
const updatePaymentFromWebhook = async (userId, paymentData) => {
  try {
    const updateData = {
      isPaid: true,
      paymentDate: new Date(),
      paymentMethod: 'vendorapay',
      paymentAmount: paymentData.amount,
      transactionId: paymentData.transactionId,
      currency: paymentData.currency || 'MZN'
    };

    await updateDoc(doc(db, 'users', userId), updateData);
    console.log('✅ Status do usuário atualizado no Firebase:', { userId, ...updateData });
    
    return { success: true };
  } catch (error) {
    console.error('❌ Erro ao atualizar status do usuário:', error);
    throw error;
  }
};

// API Routes

// Webhook da vendorapay.com
app.post('/api/webhook/vendorapay', async (req, res) => {
  try {
    console.log('Webhook recebido:', {
      body: req.body,
      headers: req.headers
    });

    const webhookData = req.body;
    const signature = req.headers['x-vendorapay-signature'] || req.headers['x-signature'];

    // Verificar assinatura (opcional para desenvolvimento)
    if (signature && !verifyWebhookSignature(JSON.stringify(webhookData), signature)) {
      console.error('Assinatura inválida do webhook');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Processar webhook
    const result = processWebhook(webhookData);

    if (!result.success) {
      console.error('Erro ao processar webhook:', result.error);
      return res.status(400).json({ error: result.error });
    }

    // Se o pagamento foi aprovado, atualizar status do usuário
    if (result.isApproved) {
      console.log('Pagamento aprovado:', {
        transactionId: result.transactionId,
        amount: result.amount,
        currency: result.currency,
        context: result.context
      });

      try {
        // Tentar obter usuário do mapeamento de transações
        const transactionUser = getTransactionUser(result.transactionId);
        
        // Fallback: tentar extrair UID do webhook
        const userId = transactionUser?.userId || webhookData.userId || webhookData.uid;
        
        if (userId) {
          const paymentData = {
            amount: result.amount,
            transactionId: result.transactionId,
            currency: result.currency,
            context: result.context
          };
          
          await updatePaymentFromWebhook(userId, paymentData);
          console.log('✅ Status do usuário atualizado no Firebase');
          
          // Limpar mapeamento após processamento
          clearTransactionUser(result.transactionId);
        } else {
          console.log('⚠️ UID do usuário não encontrado:', {
            transactionId: result.transactionId,
            webhookData: webhookData,
            transactionUser: transactionUser
          });
        }
      } catch (updateError) {
        console.error('❌ Erro ao atualizar status do usuário:', updateError);
      }

      console.log('✅ Pagamento processado com sucesso:', {
        transactionId: result.transactionId,
        amount: result.amount,
        currency: result.currency,
        timestamp: new Date().toISOString()
      });
    } else {
      console.log('⚠️ Pagamento não aprovado:', {
        transactionId: result.transactionId,
        status: result.status,
        amount: result.amount
      });
    }

    // Responder com sucesso
    res.status(200).json({ 
      success: true, 
      message: 'Webhook processed successfully',
      transactionId: result.transactionId
    });

  } catch (error) {
    console.error('Erro no webhook:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Registrar transação com usuário
app.post('/api/register-transaction', (req, res) => {
  try {
    const { transactionId, userId, userEmail } = req.body;
    
    if (!transactionId || !userId || !userEmail) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    registerTransactionUser(transactionId, userId, userEmail);
    
    res.status(200).json({ 
      success: true, 
      message: 'Transaction registered successfully' 
    });
  } catch (error) {
    console.error('Erro ao registrar transação:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Verificar status de pagamento
app.get('/api/payment-status/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;
    
    // Verificar se a transação foi processada
    const transactionUser = getTransactionUser(transactionId);
    
    res.status(200).json({
      success: true,
      transactionId,
      isProcessed: !transactionUser, // Se não existe no mapa, foi processada
      user: transactionUser
    });
  } catch (error) {
    console.error('Erro ao verificar status:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Servir arquivos estáticos do React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📡 Webhook endpoint: http://localhost:${PORT}/api/webhook/vendorapay`);
  console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;