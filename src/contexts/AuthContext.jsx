import React, { createContext, useContext, useState, useEffect } from 'react'
import { auth, db } from '../services/firebase'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'

// Contexto de autenticação
const AuthContext = createContext()

// Hook personalizado para usar o contexto
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

// Função para tratar erros do Firebase
const getErrorMessage = (error) => {
  switch (error.code) {
    case 'auth/user-not-found':
      return 'Usuário não encontrado. Verifique se o email está correto ou crie uma nova conta.'
    case 'auth/wrong-password':
      return 'Senha incorreta. Tente novamente ou use "Esqueci minha senha".'
    case 'auth/invalid-credential':
      return 'Credenciais inválidas. Verifique seu email e senha, ou crie uma nova conta se ainda não tem uma.'
    case 'auth/invalid-login-credentials':
      return 'Email ou senha incorretos. Verifique suas credenciais ou crie uma nova conta.'
    case 'auth/email-already-in-use':
      return 'Este email já está sendo usado por outra conta. Tente fazer login ou use outro email.'
    case 'auth/weak-password':
      return 'A senha deve ter pelo menos 6 caracteres para maior segurança.'
    case 'auth/invalid-email':
      return 'Email inválido. Verifique se o formato está correto (exemplo@email.com).'
    case 'auth/too-many-requests':
      return 'Muitas tentativas de login. Aguarde alguns minutos e tente novamente.'
    case 'auth/network-request-failed':
      return 'Erro de conexão. Verifique sua internet e tente novamente.'
    case 'auth/popup-closed-by-user':
      return 'Login cancelado. Tente novamente se desejar continuar.'
    case 'auth/popup-blocked':
      return 'Popup bloqueado pelo navegador. Permita popups para este site e tente novamente.'
    case 'auth/account-exists-with-different-credential':
      return 'Já existe uma conta com este email usando outro método de login.'
    case 'auth/requires-recent-login':
      return 'Por segurança, faça login novamente para continuar.'
    case 'auth/user-disabled':
      return 'Esta conta foi desabilitada. Entre em contato com o suporte.'
    case 'auth/operation-not-allowed':
      return 'Operação não permitida. Entre em contato com o suporte.'
    case 'auth/credential-already-in-use':
      return 'Esta credencial já está sendo usada por outra conta.'
    default:
      return 'Ops! Algo deu errado. Verifique suas informações e tente novamente.'
  }
}

// Provedor do contexto
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Função para login com email e senha
  const login = async (email, password) => {
    try {
      // Validações básicas
      if (!email || !password) {
        throw new Error('Email e senha são obrigatórios')
      }

      if (!email.includes('@')) {
        throw new Error('Email inválido')
      }

      if (password.length < 6) {
        throw new Error('A senha deve ter pelo menos 6 caracteres')
      }

      const result = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password)
      
      // Atualizar último login
      await updateDoc(doc(db, 'users', result.user.uid), {
        lastLogin: new Date()
      }).catch(() => {
        // Se falhar, não é crítico
        console.warn('Não foi possível atualizar último login')
      })

      await fetchUserProfile(result.user.uid)
      return result
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  // Função para registro com email e senha
  const register = async (email, password, name) => {
    try {
      // Validações básicas
      if (!email || !password || !name) {
        throw new Error('Todos os campos são obrigatórios')
      }

      if (!email.includes('@')) {
        throw new Error('Email inválido')
      }

      if (password.length < 6) {
        throw new Error('A senha deve ter pelo menos 6 caracteres')
      }

      if (name.trim().length < 2) {
        throw new Error('Nome deve ter pelo menos 2 caracteres')
      }

      const result = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password)
      
      // Atualizar perfil do usuário no Firebase Auth
      await updateProfile(result.user, {
        displayName: name.trim()
      })
      
      // Criar perfil do usuário no Firestore
      const userProfile = {
        uid: result.user.uid,
        email: email.trim().toLowerCase(),
        name: name.trim(),
        isPaid: false,
        createdAt: new Date(),
        lastLogin: new Date(),
        emailVerified: false,
        provider: 'email',
        displayName: name.trim()
      }
      
      await setDoc(doc(db, 'users', result.user.uid), userProfile)
      setUserProfile(userProfile)

      // Enviar email de verificação
      try {
        await sendEmailVerification(result.user)
      } catch (emailError) {
        console.warn('Não foi possível enviar email de verificação:', emailError)
      }
      
      return result
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  // Função para login com Google
  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider()
      
      // Configurar escopo para obter mais informações do usuário
      provider.addScope('email')
      provider.addScope('profile')
      
      const result = await signInWithPopup(auth, provider)
      
      // Verificar se o usuário já existe
      const userDoc = await getDoc(doc(db, 'users', result.user.uid))
      
      if (!userDoc.exists()) {
        // Criar novo usuário
        const displayName = result.user.displayName || 
                           result.user.email?.split('@')[0] || 
                           'Usuário Google'
        
        const userProfile = {
          uid: result.user.uid,
          email: result.user.email,
          name: displayName,
          isPaid: false,
          createdAt: new Date(),
          lastLogin: new Date(),
          emailVerified: result.user.emailVerified,
          provider: 'google',
          photoURL: result.user.photoURL
        }
        await setDoc(doc(db, 'users', result.user.uid), userProfile)
        setUserProfile(userProfile)
      } else {
        // Atualizar último login
        await updateDoc(doc(db, 'users', result.user.uid), {
          lastLogin: new Date()
        }).catch(() => {
          console.warn('Não foi possível atualizar último login')
        })
        await fetchUserProfile(result.user.uid)
      }
      
      return result
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  // Função para logout
  const logout = async () => {
    try {
      await signOut(auth)
      setCurrentUser(null)
      setUserProfile(null)
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  // Função para redefinir senha
  const resetPassword = async (email) => {
    try {
      if (!email || !email.includes('@')) {
        throw new Error('Email inválido')
      }

      await sendPasswordResetEmail(auth, email.trim().toLowerCase())
      return { success: true, message: 'Email de redefinição enviado com sucesso!' }
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  // Função para reenviar email de verificação
  const resendEmailVerification = async () => {
    try {
      if (!currentUser) {
        throw new Error('Usuário não está logado')
      }

      await sendEmailVerification(currentUser)
      return { success: true, message: 'Email de verificação reenviado!' }
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  // Função para buscar perfil do usuário
  const fetchUserProfile = async (uid) => {
    console.log('fetchUserProfile - Iniciando busca para UID:', uid)
    try {
      const userDoc = await getDoc(doc(db, 'users', uid))
      console.log('fetchUserProfile - Documento existe:', userDoc.exists())
      
      if (userDoc.exists()) {
        const profileData = userDoc.data()
        console.log('fetchUserProfile - Dados do perfil encontrados:', profileData)
        setUserProfile(profileData)
        return profileData
      } else {
        console.log('fetchUserProfile - Documento não existe, criando perfil básico')
        // Se o documento não existe, criar um perfil básico
        const basicProfile = {
          uid: uid,
          email: currentUser?.email || '',
          name: currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Usuário',
          isPaid: false,
          createdAt: new Date(),
          lastLogin: new Date(),
          emailVerified: currentUser?.emailVerified || false,
          provider: currentUser?.providerData?.[0]?.providerId || 'email'
        }
        
        try {
          await setDoc(doc(db, 'users', uid), basicProfile)
          console.log('fetchUserProfile - Perfil básico criado no Firestore:', basicProfile)
          setUserProfile(basicProfile)
          return basicProfile
        } catch (setError) {
          console.warn('Não foi possível criar perfil no Firestore:', setError)
          setUserProfile(basicProfile)
          return basicProfile
        }
      }
    } catch (error) {
      console.error('Erro ao buscar perfil:', error)
      // Se houver erro de permissão, criar um perfil local temporário
      const fallbackProfile = {
        uid: uid,
        email: currentUser?.email || '',
        name: currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Usuário',
        isPaid: false,
        createdAt: new Date(),
        lastLogin: new Date(),
        emailVerified: currentUser?.emailVerified || false
      }
      console.log('fetchUserProfile - Criando perfil de fallback:', fallbackProfile)
      setUserProfile(fallbackProfile)
      return fallbackProfile
    }
  }

  // Função para atualizar status de pagamento
  const updatePaymentStatus = async (uid, isPaid) => {
    try {
      await updateDoc(doc(db, 'users', uid), {
        isPaid: isPaid,
        paymentDate: new Date()
      })
      
      setUserProfile(prev => ({
        ...prev,
        isPaid: isPaid,
        paymentDate: new Date()
      }))
    } catch (error) {
      throw error
    }
  }

  // Função para simular pagamento (para testes)
  const simulatePayment = async (uid) => {
    try {
      // Simular delay de processamento
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Atualizar status de pagamento
      await updateDoc(doc(db, 'users', uid), {
        isPaid: true,
        paymentDate: new Date(),
        paymentMethod: 'simulado',
        paymentAmount: 299 // MZN 299,00
      })
      
      setUserProfile(prev => ({
        ...prev,
        isPaid: true,
        paymentDate: new Date(),
        paymentMethod: 'simulado',
        paymentAmount: 299
      }))
      
      return {
        success: true,
        sessionId: `sim_${Date.now()}`,
        amount: 299
      }
    } catch (error) {
      throw error
    }
  }

  // Função para atualizar status de pagamento via webhook
  const updatePaymentFromWebhook = async (uid, paymentData) => {
    try {
      const updateData = {
        isPaid: true,
        paymentDate: new Date(),
        paymentMethod: 'vendorapay',
        paymentAmount: paymentData.amount,
        transactionId: paymentData.transactionId,
        currency: paymentData.currency || 'MZN'
      }

      await updateDoc(doc(db, 'users', uid), updateData)
      
      setUserProfile(prev => ({
        ...prev,
        ...updateData
      }))

      return { success: true }
    } catch (error) {
      console.error('Erro ao atualizar pagamento via webhook:', error)
      throw error
    }
  }

  // Função para atualizar perfil do usuário
  const updateUserProfile = async (profileData) => {
    try {
      if (!currentUser) {
        throw new Error('Usuário não está logado')
      }

      // Atualizar no Firestore
      await updateDoc(doc(db, 'users', currentUser.uid), {
        name: profileData.name,
        phone: profileData.phone,
        company: profileData.company,
        updatedAt: new Date()
      })

      // Atualizar estado local
      setUserProfile(prev => ({
        ...prev,
        name: profileData.name,
        phone: profileData.phone,
        company: profileData.company,
        updatedAt: new Date()
      }))

      return { success: true, message: 'Perfil atualizado com sucesso!' }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      throw new Error('Erro ao atualizar perfil: ' + getErrorMessage(error))
    }
  }

  // Função para salvar progresso do curso no Firebase
  const saveCourseProgress = async (watchedVideos) => {
    try {
      if (!currentUser) {
        throw new Error('Usuário não está logado')
      }

      const progressData = {
        watchedVideos: Array.from(watchedVideos),
        lastUpdated: new Date(),
        totalVideos: 8,
        completedVideos: watchedVideos.size,
        progressPercentage: Math.round((watchedVideos.size / 8) * 100)
      }

      // Salvar no Firestore
      await updateDoc(doc(db, 'users', currentUser.uid), {
        courseProgress: progressData,
        updatedAt: new Date()
      })

      console.log('Progresso salvo no Firebase:', progressData)
      return { success: true, data: progressData }
    } catch (error) {
      console.error('Erro ao salvar progresso:', error)
      return { success: false, error: error.message }
    }
  }

  // Função para carregar progresso do curso do Firebase
  const loadCourseProgress = async () => {
    try {
      if (!currentUser) {
        return { success: false, error: 'Usuário não está logado' }
      }

      const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
      
      if (userDoc.exists()) {
        const userData = userDoc.data()
        const courseProgress = userData.courseProgress
        
        if (courseProgress && courseProgress.watchedVideos) {
          return { 
            success: true, 
            data: new Set(courseProgress.watchedVideos),
            progressInfo: courseProgress
          }
        }
      }

      return { success: true, data: new Set() }
    } catch (error) {
      console.error('Erro ao carregar progresso:', error)
      return { success: false, error: error.message }
    }
  }

  // Listener para mudanças de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('AuthContext - onAuthStateChanged:', user)
      try {
        if (user) {
          setCurrentUser(user)
          console.log('AuthContext - Buscando perfil para usuário:', user.uid)
          // Simular carregamento rápido para melhor UX
          const loadingPromise = fetchUserProfile(user.uid)
          const timeoutPromise = new Promise(resolve => setTimeout(resolve, 800)) // Mínimo de 800ms
          
          await Promise.all([loadingPromise, timeoutPromise])
          console.log('AuthContext - Perfil carregado com sucesso')
        } else {
          setCurrentUser(null)
          setUserProfile(null)
          // Simular carregamento mínimo
          setTimeout(() => setLoading(false), 500)
        }
      } catch (error) {
        console.warn('Erro de rede durante autenticação:', error.message)
        // Em caso de erro de rede, continuar com o usuário atual se existir
        if (user) {
          setCurrentUser(user)
          // Criar perfil local temporário se não conseguir buscar do Firestore
          const fallbackProfile = {
            uid: user.uid,
            email: user.email,
            name: user.displayName || user.email?.split('@')[0] || 'Usuário',
            isPaid: false,
            createdAt: new Date(),
            lastLogin: new Date(),
            emailVerified: user.emailVerified || false,
            provider: user.providerData[0]?.providerId || 'email'
          }
          setUserProfile(fallbackProfile)
          console.log('AuthContext - Perfil de fallback criado:', fallbackProfile)
        }
      } finally {
        setLoading(false)
      }
    })

    return unsubscribe
  }, [])

  // Valor do contexto
  const value = {
    currentUser,
    userProfile,
    login,
    register,
    loginWithGoogle,
    logout,
    resetPassword,
    resendEmailVerification,
    updatePaymentStatus,
    simulatePayment,
    updatePaymentFromWebhook,
    updateUserProfile,
    saveCourseProgress,
    loadCourseProgress,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
