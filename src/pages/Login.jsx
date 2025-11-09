import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { validateLoginForm, validateRegistrationForm, sanitizeInput } from '../utils/authValidation'
import { ButtonSpinner } from '../components/LoadingSpinner'
import BotaoCTA from '../components/BotaoCTA'
import metaPixelService from '../services/metaPixel'

const Login = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showResetPassword, setShowResetPassword] = useState(false)
  
  const navigate = useNavigate()
  const location = useLocation()
  const { login, register, loginWithGoogle, resetPassword, currentUser, userProfile } = useAuth()
  
  // Scroll para o topo quando a página carregar
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Meta Pixel - Rastrear visualização da página de login
  useEffect(() => {
    metaPixelService.trackLoginStart();
  }, []);

  // Redirecionar usuários já logados para o Dashboard
  useEffect(() => {
    if (currentUser && userProfile) {
      if (userProfile.isPaid) {
        // Se já pagou, vai para dashboard
        navigate('/dashboard', { replace: true });
      } else {
        // Se não pagou, vai para pagamento
        navigate('/payment', { replace: true });
      }
    }
  }, [currentUser, userProfile, navigate]);

  // Redirecionar para a página que o usuário tentou acessar
  const from = location.state?.from?.pathname || '/payment'

  const handleInputChange = (e) => {
    const { name, value } = e.target
    const sanitizedValue = sanitizeInput(value)
    
    setFormData(prev => ({
      ...prev,
      [name]: sanitizedValue
    }))

    // Limpar erro quando usuário começar a digitar
    if (error) {
      setError('')
    }
  }

    const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Validação do formulário
      const validation = isLogin 
        ? validateLoginForm(formData)
        : validateRegistrationForm(formData)

      if (!validation.isValid) {
        const firstError = Object.values(validation.errors)[0]
        setError(firstError)
        return
      }

      if (isLogin) {
        const result = await login(formData.email, formData.password)
        // Meta Pixel - Rastrear login bem-sucedido
        metaPixelService.trackLoginSuccess();
        // Aguardar um momento para o perfil carregar
        setTimeout(() => {
          // Sempre redirecionar para dashboard após login bem-sucedido
          navigate('/dashboard')
        }, 1000)
      } else {
        await register(formData.email, formData.password, formData.name)
        // Meta Pixel - Rastrear registro bem-sucedido
        metaPixelService.trackLoginSuccess();
        // Após registro, vai para pagamento
        navigate('/payment')
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true)
      setError('')
      await loginWithGoogle()
      // Meta Pixel - Rastrear login com Google bem-sucedido
      metaPixelService.trackLoginSuccess();
      // Aguardar um momento para o perfil carregar
      setTimeout(() => {
        // Sempre redirecionar para dashboard após login com Google
        navigate('/dashboard')
      }, 1000)
    } catch (error) {
      setError('Erro ao fazer login com Google: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setError('')
    setSuccess('')
    setShowResetPassword(false)
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    })
  }

  const handleResetPassword = async () => {
    if (!formData.email) {
      setError('Digite seu email para redefinir a senha')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const result = await resetPassword(formData.email)
      setSuccess(result.message)
      setShowResetPassword(false)
    } catch (error) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12">
      <div className="container-custom">
        <div className="max-w-md mx-auto">
          {/* Cabeçalho */}
          <div className="text-center mb-8">
            <div className="mb-4">
              <span className="text-2xl font-bold text-gray-800">LacasaDigital</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isLogin ? 'Entrar na sua conta' : 'Criar nova conta'}
            </h1>
            <p className="text-gray-600">
              {isLogin 
                ? 'Acesse seu painel e continue aprendendo' 
                : 'Comece sua jornada de transformação hoje mesmo'
              }
            </p>
          </div>

          {/* Formulário */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nome (apenas no registro) */}
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Seu nome completo"
                    required
                  />
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="seu@email.com"
                  required
                />
              </div>

              {/* Senha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Sua senha"
                  required
                />
              </div>

              {/* Confirmar Senha (apenas no registro) */}
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Senha *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Confirme sua senha"
                    required
                  />
                </div>
              )}

              {/* Erro */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-red-700">{error}</span>
                  </div>
                </div>
              )}

              {/* Sucesso */}
              {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-green-700">{success}</span>
                  </div>
                </div>
              )}

              {/* Botão de Login/Registro */}
              <BotaoCTA
                type="submit"
                fullWidth
                disabled={isLoading}
                className={isLoading ? 'opacity-50 cursor-not-allowed' : ''}
              >
                {isLoading ? (
                  <ButtonSpinner color="white" />
                ) : (
                  isLogin ? 'Entrar' : 'Criar Conta'
                )}
              </BotaoCTA>

              {/* Link para redefinir senha */}
              {isLogin && (
                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
                  >
                    Esqueceu sua senha?
                  </button>
                </div>
              )}

              {/* Formulário de redefinir senha */}
              {showResetPassword && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Redefinir Senha
                  </h3>
                  <p className="text-xs text-gray-600 mb-3">
                    Digite seu email para receber um link de redefinição
                  </p>
                  <div className="flex space-x-2">
                    <input
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      name="email"
                      placeholder="Seu email"
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={handleResetPassword}
                      disabled={isLoading}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
                    >
                      Enviar
                    </button>
                  </div>
                </div>
              )}

              {/* Divisor */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">ou</span>
                </div>
              </div>

              {/* Login com Google */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-3 bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>
                  {isLogin ? 'Entrar com Google' : 'Criar conta com Google'}
                </span>
              </button>

              {/* Link para alternar modo */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  {isLogin 
                    ? 'Não tem uma conta? Criar conta' 
                    : 'Já tem uma conta? Entrar'
                  }
                </button>
              </div>
            </form>
          </div>

          {/* Links adicionais */}
          <div className="text-center mt-6">
            <Link 
              to="/" 
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Voltar para Home
            </Link>
          </div>

          {/* Informações de segurança */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span>Login 100% seguro e protegido</span>
            </div>
          </div>
        </div>
      </div>

      {/* Botão Flutuante do WhatsApp */}
      <motion.a
        href="https://wa.me/258874006962"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
        className="fixed bottom-6 right-6 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50"
        onClick={() => metaPixelService.trackWhatsAppClick()}
      >
        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
        </svg>
      </motion.a>
    </div>
  )
}

export default Login
