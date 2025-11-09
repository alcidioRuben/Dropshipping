import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { PageLoadingSpinner } from '../components/LoadingSpinner'
import BotaoCTA from '../components/BotaoCTA'

const Profile = () => {
  const navigate = useNavigate()
  const { currentUser, userProfile, logout, updateUserProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: userProfile?.name || '',
    email: userProfile?.email || '',
    phone: userProfile?.phone || '',
    company: userProfile?.company || ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [pageLoading, setPageLoading] = useState(true)

  // Debug: Log dos dados do usuário
  console.log('Profile - currentUser:', currentUser)
  console.log('Profile - userProfile:', userProfile)

  // Simular carregamento rápido da página
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false)
    }, 400) // 400ms para profile

    return () => clearTimeout(timer)
  }, [])

  // Atualizar formData quando userProfile mudar
  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        company: userProfile.company || ''
      })
    }
  }, [userProfile])

  if (pageLoading) {
    return <PageLoadingSpinner text="Carregando perfil..." />
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async () => {
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      // Validar dados obrigatórios
      if (!formData.name.trim()) {
        throw new Error('Nome é obrigatório')
      }

      // Atualizar perfil no Firebase
      const result = await updateUserProfile(formData)
      
      setSuccess(result.message)
      setIsEditing(false)
    } catch (error) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: userProfile?.name || '',
      email: userProfile?.email || '',
      phone: userProfile?.phone || '',
      company: userProfile?.company || ''
    })
    setIsEditing(false)
    setError('')
    setSuccess('')
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    
    try {
      // Se for um objeto Firestore Timestamp
      if (date.seconds) {
        return new Date(date.seconds * 1000).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
      }
      
      // Se for uma string ou Date
      return new Date(date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    } catch (error) {
      console.error('Erro ao formatar data:', error)
      return 'Data inválida'
    }
  }

  // Debug: Mostrar informações de debug temporariamente
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Verificando autenticação...</h2>
          <p className="text-gray-500">Aguarde um momento</p>
          <div className="mt-4 p-4 bg-yellow-100 rounded-lg">
            <p className="text-sm text-yellow-800">Debug: currentUser é null</p>
          </div>
        </div>
      </div>
    )
  }

  // Se há usuário mas não há perfil ainda, mostrar loading com debug
  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Carregando perfil...</h2>
          <p className="text-gray-500">Buscando suas informações</p>
          <div className="mt-4 p-4 bg-blue-100 rounded-lg">
            <p className="text-sm text-blue-800">Debug: currentUser existe mas userProfile é null</p>
            <p className="text-xs text-blue-600 mt-1">Email: {currentUser.email}</p>
            <p className="text-xs text-blue-600">UID: {currentUser.uid}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          {/* Cabeçalho */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Meu Perfil
                </h1>
                <p className="text-gray-600">
                  Olá, <span className="font-semibold text-blue-600">
                    {userProfile?.name || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Aluno'}
                  </span>! Gerencie suas informações pessoais e configurações da conta
                </p>
              </div>
              <BotaoCTA to="/dashboard" variant="outline">
                Voltar ao Painel
              </BotaoCTA>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Informações do Perfil */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Informações Pessoais
                  </h2>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Editar
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          required
                        />
                      </div>
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
                          required
                          disabled
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          O email não pode ser alterado
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Telefone
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="input-field"
                          placeholder="(11) 99999-9999"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Empresa
                        </label>
                        <input
                          type="text"
                          name="company"
                          value={formData.company}
                          onChange={handleInputChange}
                          className="input-field"
                          placeholder="Nome da empresa"
                        />
                      </div>
                    </div>

                    {/* Mensagens de erro/sucesso */}
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

                    {/* Botões de ação */}
                    <div className="flex space-x-4">
                      <BotaoCTA
                        onClick={handleSave}
                        disabled={isLoading}
                        className={isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                      >
                        {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                      </BotaoCTA>
                      <button
                        onClick={handleCancel}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Nome Completo
                        </label>
                        <p className="text-gray-900">{userProfile.name || 'Não informado'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Email
                        </label>
                        <p className="text-gray-900">{userProfile.email}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Telefone
                        </label>
                        <p className="text-gray-900">{userProfile.phone || 'Não informado'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Empresa
                        </label>
                        <p className="text-gray-900">{userProfile.company || 'Não informado'}</p>
                      </div>
                    </div>
                    
                    {/* Status de Pagamento */}
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">
                            Status do Curso
                          </label>
                          <div className="flex items-center space-x-2">
                            {userProfile.isPaid ? (
                              <>
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span className="text-green-700 font-medium">Acesso Completo</span>
                              </>
                            ) : (
                              <>
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                <span className="text-red-700 font-medium">Aguardando Pagamento</span>
                              </>
                            )}
                          </div>
                        </div>
                        {userProfile.isPaid && (
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Data do Pagamento</p>
                            <p className="text-sm font-medium text-gray-900">
                              {userProfile.paymentDate ? 
                                formatDate(userProfile.paymentDate) : 
                                'Não informado'
                              }
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar com Informações da Conta */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                {/* Status da Conta */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Status da Conta
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status de Pagamento</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        userProfile.isPaid 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {userProfile.isPaid ? 'Ativo' : 'Pendente'}
                      </span>
                    </div>
                    
                    {userProfile.isPaid && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Data do Pagamento</span>
                        <span className="text-sm text-gray-900">
                          {formatDate(userProfile.paymentDate)}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Membro desde</span>
                      <span className="text-sm text-gray-900">
                        {formatDate(userProfile.createdAt)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Último login</span>
                      <span className="text-sm text-gray-900">
                        {formatDate(userProfile.lastLogin)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ações Rápidas */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Ações Rápidas
                  </h3>
                  
                  <div className="space-y-3">
                    <BotaoCTA to="/dashboard" fullWidth>
                      Acessar Painel
                    </BotaoCTA>
                    
                    {userProfile.isPaid && (
                      <BotaoCTA to="/dashboard" fullWidth variant="outline">
                        Acessar Vídeo Aulas
                      </BotaoCTA>
                    )}
                    
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Sair da Conta
                    </button>
                  </div>
                </div>

                {/* Suporte */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
                  <h3 className="text-lg font-semibold mb-3">
                    Precisa de Ajuda?
                  </h3>
                  <p className="text-sm opacity-90 mb-4">
                    Nossa equipe está sempre pronta para ajudar você
                  </p>
                  <a
                    href="mailto:suporte@lacasadigital.com"
                    className="inline-block bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-all duration-200"
                  >
                    Contatar Suporte
                  </a>
                </div>
              </div>
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
      >
        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
        </svg>
      </motion.a>
    </div>
  )
}

export default Profile
