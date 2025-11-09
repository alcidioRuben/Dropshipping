import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { PageLoadingSpinner } from '../components/LoadingSpinner'
import metaPixelService from '../services/metaPixel'

const Recursos = () => {
  const { currentUser, userProfile, saveCourseProgress, loadCourseProgress } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("Todos")
  const [playingVideo, setPlayingVideo] = useState(null)
  const [watchedVideos, setWatchedVideos] = useState(new Set())

  // Carregar progresso salvo do Firebase
  useEffect(() => {
    const loadProgress = async () => {
      if (currentUser) {
        try {
          const result = await loadCourseProgress();
          if (result.success && result.data) {
            setWatchedVideos(result.data);
            console.log('Progresso carregado do Firebase (Recursos):', result.progressInfo);
          }
        } catch (error) {
          console.error('Erro ao carregar progresso do Firebase:', error);
          
          // Fallback para localStorage se Firebase falhar
          const savedProgress = localStorage.getItem('courseProgress');
          if (savedProgress) {
            try {
              const progressData = JSON.parse(savedProgress);
              setWatchedVideos(new Set(progressData.watchedVideos || []));
            } catch (localError) {
              console.error('Erro ao carregar progresso do localStorage:', localError);
            }
          }
        }
      }
    };

    loadProgress();
  }, [currentUser, loadCourseProgress]);

  // Salvar progresso no Firebase e localStorage sempre que mudar
  useEffect(() => {
    const saveProgress = async () => {
      if (watchedVideos.size > 0 && currentUser) {
        try {
          // Salvar no Firebase
          await saveCourseProgress(watchedVideos);
          
          // Também salvar no localStorage como backup
          const progressData = {
            watchedVideos: Array.from(watchedVideos),
            lastUpdated: new Date().toISOString()
          };
          localStorage.setItem('courseProgress', JSON.stringify(progressData));
        } catch (error) {
          console.error('Erro ao salvar progresso no Firebase:', error);
          
          // Se Firebase falhar, pelo menos salvar no localStorage
          const progressData = {
            watchedVideos: Array.from(watchedVideos),
            lastUpdated: new Date().toISOString()
          };
          localStorage.setItem('courseProgress', JSON.stringify(progressData));
        }
      }
    };

    saveProgress();
  }, [watchedVideos, currentUser, saveCourseProgress]);

  // Função para marcar vídeo como assistido
  const markVideoAsWatched = (videoId) => {
    if (!watchedVideos.has(videoId)) {
      setWatchedVideos(prev => new Set([...prev, videoId]));
      console.log(`Vídeo ${videoId} marcado como assistido automaticamente`);
    }
  };

  // Função para detectar quando o vídeo começa a tocar
  const handleVideoPlay = (videoId) => {
    // Marcar como assistido quando o vídeo começa a tocar
    markVideoAsWatched(videoId);
  };

  // Função para detectar quando o usuário clica no play
  const handlePlayClick = (videoId) => {
    // Marcar como assistido imediatamente quando clica no play
    markVideoAsWatched(videoId);
  };

  // Função para verificar se vídeo foi assistido
  const isVideoWatched = (videoId) => {
    return watchedVideos.has(videoId);
  };

  // Simular carregamento rápido da página
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 600) // 600ms para dar sensação de rapidez

    return () => clearTimeout(timer)
  }, [])

  // Meta Pixel - Rastrear visualização da página de recursos
  useEffect(() => {
    metaPixelService.trackResourcesPageView();
  }, [])

  if (isLoading) {
    return <PageLoadingSpinner text="Carregando vídeo aulas..." />
  }

  // Dados dos vídeos do curso
  const videoLessons = [
    {
      id: 1,
      title: "1. Introdução",
      description: "Aula introdutória do curso. Conheça os fundamentos e o que você vai aprender.",
      duration: "15:30",
      thumbnail: "https://img.youtube.com/vi/TDnkzEpC2Dk/maxresdefault.jpg",
      videoUrl: "https://www.youtube.com/watch?v=TDnkzEpC2Dk",
      category: "Fundamentos",
      isCompleted: false,
      youtubeId: "TDnkzEpC2Dk"
    },
    {
      id: 2,
      title: "2. Decisão",
      description: "Aprenda a tomar as decisões certas para o sucesso no seu negócio.",
      duration: "18:45",
      thumbnail: "https://img.youtube.com/vi/PTtN-gnI0Xg/maxresdefault.jpg",
      videoUrl: "https://www.youtube.com/watch?v=PTtN-gnI0Xg",
      category: "Fundamentos",
      isCompleted: false,
      youtubeId: "PTtN-gnI0Xg"
    },
    {
      id: 3,
      title: "3. Ambiente",
      description: "Como criar o ambiente ideal para o desenvolvimento do seu negócio.",
      duration: "22:15",
      thumbnail: "https://img.youtube.com/vi/o17IkxNd0TI/maxresdefault.jpg",
      videoUrl: "https://www.youtube.com/watch?v=o17IkxNd0TI",
      category: "Fundamentos",
      isCompleted: false,
      youtubeId: "o17IkxNd0TI"
    },
    {
      id: 4,
      title: "4. Mente Milionária",
      description: "Desenvolva a mentalidade necessária para alcançar o sucesso financeiro.",
      duration: "25:30",
      thumbnail: "https://img.youtube.com/vi/xAY8KUxTIqw/maxresdefault.jpg",
      videoUrl: "https://www.youtube.com/watch?v=xAY8KUxTIqw",
      category: "Mentalidade",
      isCompleted: false,
      youtubeId: "xAY8KUxTIqw"
    },
    {
      id: 5,
      title: "5. Forma de Fazer Dinheiro",
      description: "Descubra as diferentes formas de gerar renda e construir riqueza.",
      duration: "28:20",
      thumbnail: "https://img.youtube.com/vi/EEIQVQUHADU/maxresdefault.jpg",
      videoUrl: "https://www.youtube.com/watch?v=EEIQVQUHADU",
      category: "Estratégia",
      isCompleted: false,
      youtubeId: "EEIQVQUHADU"
    },
    {
      id: 6,
      title: "6. Modelo de Negócio",
      description: "Aprenda a estruturar e implementar um modelo de negócio eficaz.",
      duration: "32:10",
      thumbnail: "https://img.youtube.com/vi/ymiYya34ras/maxresdefault.jpg",
      videoUrl: "https://www.youtube.com/watch?v=ymiYya34ras",
      category: "Estratégia",
      isCompleted: false,
      youtubeId: "ymiYya34ras"
    },
    {
      id: 7,
      title: "7. Velocidade",
      description: "Como acelerar o crescimento do seu negócio e obter resultados mais rápidos.",
      duration: "12:45",
      thumbnail: "https://img.youtube.com/vi/T7v9YcXlOG8/maxresdefault.jpg",
      videoUrl: "https://www.youtube.com/shorts/T7v9YcXlOG8",
      category: "Aceleração",
      isCompleted: false,
      youtubeId: "T7v9YcXlOG8"
    },
    {
      id: 8,
      title: "8. Como Vai Funcionar o Nosso Negócio",
      description: "Entenda como tudo se conecta e como implementar na prática.",
      duration: "35:15",
      thumbnail: "https://img.youtube.com/vi/JeVV-Py7A-Q/maxresdefault.jpg",
      videoUrl: "https://www.youtube.com/watch?v=JeVV-Py7A-Q",
      category: "Implementação",
      isCompleted: false,
      youtubeId: "JeVV-Py7A-Q"
    },
    {
      id: 9,
      title: "9. Configurar Baixar Facebook WhatsApp e Gestor de Anúncio",
      description: "Aprenda a configurar e baixar o Facebook, WhatsApp e Gestor de Anúncios.",
      duration: "5:59",
      thumbnail: "https://img.youtube.com/vi/-Vi3TZY0zdE/maxresdefault.jpg",
      videoUrl: "https://www.youtube.com/watch?v=-Vi3TZY0zdE",
      category: "Facebook & WhatsApp",
      isCompleted: false,
      youtubeId: "-Vi3TZY0zdE"
    },
    {
      id: 10,
      title: "10. Criação de Loja e Logo",
      description: "Como criar uma loja profissional e desenvolver um logo atrativo.",
      duration: "7:12",
      thumbnail: "https://img.youtube.com/vi/-X1dh4mFbuI/maxresdefault.jpg",
      videoUrl: "https://www.youtube.com/watch?v=-X1dh4mFbuI",
      category: "Facebook & WhatsApp",
      isCompleted: false,
      youtubeId: "-X1dh4mFbuI"
    },
    {
      id: 11,
      title: "11. Configuração do Facebook",
      description: "Configuração completa da conta Facebook para negócios.",
      duration: "7:11",
      thumbnail: "https://img.youtube.com/vi/AuP3RJZZyIQ/maxresdefault.jpg",
      videoUrl: "https://www.youtube.com/watch?v=AuP3RJZZyIQ",
      category: "Facebook & WhatsApp",
      isCompleted: false,
      youtubeId: "AuP3RJZZyIQ"
    },
    {
      id: 12,
      title: "12. Criação de Anúncio",
      description: "Passo a passo para criar anúncios eficazes no Facebook.",
      duration: "3:38",
      thumbnail: "https://img.youtube.com/vi/jrLstvfbIYs/maxresdefault.jpg",
      videoUrl: "https://www.youtube.com/watch?v=jrLstvfbIYs",
      category: "Facebook & WhatsApp",
      isCompleted: false,
      youtubeId: "jrLstvfbIYs"
    },
    {
      id: 13,
      title: "13. Configuração do Gestor de Anúncio",
      description: "Como configurar e otimizar o Gestor de Anúncios do Facebook.",
      duration: "6:00",
      thumbnail: "https://img.youtube.com/vi/pIHN1rMcYrc/maxresdefault.jpg",
      videoUrl: "https://www.youtube.com/watch?v=pIHN1rMcYrc",
      category: "Facebook & WhatsApp",
      isCompleted: false,
      youtubeId: "pIHN1rMcYrc"
    },
    {
      id: 14,
      title: "14. Direcionamento do Público Alvo",
      description: "Estratégias avançadas para direcionar o público certo.",
      duration: "9:21",
      thumbnail: "https://img.youtube.com/vi/5RsEGikCaCs/maxresdefault.jpg",
      videoUrl: "https://www.youtube.com/watch?v=5RsEGikCaCs",
      category: "Facebook & WhatsApp",
      isCompleted: false,
      youtubeId: "5RsEGikCaCs"
    },
    {
      id: 15,
      title: "15. Adicionando Dados Bancários",
      description: "Como adicionar dados bancários de forma segura.",
      duration: "6:30",
      thumbnail: "https://img.youtube.com/vi/3RxeobirXbo/maxresdefault.jpg",
      videoUrl: "https://www.youtube.com/watch?v=3RxeobirXbo",
      category: "Facebook & WhatsApp",
      isCompleted: false,
      youtubeId: "3RxeobirXbo"
    },
    {
      id: 16,
      title: "16. Configuração de Últimos Detalhes",
      description: "Finalizando a configuração com os últimos detalhes importantes.",
      duration: "6:16",
      thumbnail: "https://img.youtube.com/vi/8PKzDqeXz8o/maxresdefault.jpg",
      videoUrl: "https://www.youtube.com/watch?v=8PKzDqeXz8o",
      category: "Facebook & WhatsApp",
      isCompleted: false,
      youtubeId: "8PKzDqeXz8o"
    }
  ]

  const categories = ["Todos", "Fundamentos", "Mentalidade", "Estratégia", "Aceleração", "Implementação", "Facebook & WhatsApp"]

  const filteredVideos = selectedCategory === "Todos" 
    ? videoLessons 
    : videoLessons.filter(video => video.category === selectedCategory)

  const completedVideos = videoLessons.filter(video => isVideoWatched(video.youtubeId)).length
  const progressPercentage = (completedVideos / videoLessons.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header Premium */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
        
        <div className="relative container-custom py-6 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center text-white"
          >
            {/* Badge Premium */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center px-3 py-1.5 md:px-6 md:py-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full text-black font-bold text-xs md:text-sm mb-4 md:mb-8 shadow-2xl"
            >
              <svg className="w-3 h-3 md:w-5 md:h-5 mr-1 md:mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="hidden sm:inline">CURSO PREMIUM</span>
              <span className="sm:hidden">PREMIUM</span>
            </motion.div>

            <h1 className="text-2xl md:text-4xl lg:text-6xl font-black mb-3 md:mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent leading-tight">
              <span className="block md:hidden">Curso de</span>
              <span className="hidden md:block">Curso Completo de</span>
              <br />
              <span className="text-yellow-400">Dropshipping</span>
            </h1>
            
            <p className="text-sm md:text-xl lg:text-2xl text-blue-100 mb-2 md:mb-4 font-medium">
              Olá, <span className="font-bold text-yellow-400">
                {userProfile?.name || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Aluno'}
              </span>! 👋
            </p>
            
            <p className="text-xs md:text-lg lg:text-xl text-blue-200 mb-6 md:mb-12 max-w-4xl mx-auto leading-relaxed px-4">
              <span className="hidden md:inline">Transforme sua vida financeira com as 8 aulas exclusivas que vão revolucionar sua mentalidade e estratégias de negócio</span>
              <span className="md:hidden">8 aulas exclusivas para transformar sua vida financeira</span>
            </p>
            
            {/* Progress Bar Premium */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="max-w-2xl mx-auto px-4"
            >
              <div className="flex justify-between items-center mb-2 md:mb-4">
                <span className="text-sm md:text-lg font-semibold text-white">Progresso</span>
                <span className="text-sm md:text-lg text-yellow-400 font-bold">{completedVideos}/{videoLessons.length} aulas</span>
              </div>
              <div className="w-full bg-white bg-opacity-20 rounded-full h-3 md:h-6 shadow-inner backdrop-blur-sm">
                <motion.div
                  className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 h-3 md:h-6 rounded-full shadow-lg relative overflow-hidden"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 2, delay: 0.8 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
                </motion.div>
              </div>
              <div className="mt-2 md:mt-3 text-center">
                <span className="text-lg md:text-2xl font-bold text-yellow-400">{Math.round(progressPercentage)}% completo</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="container-custom py-6 md:py-12">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-12">
          {/* Sidebar Premium - Filtros */}
          <div className="lg:w-1/4">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl md:rounded-3xl shadow-2xl p-4 md:p-8 sticky top-4 md:top-8 border border-white/20"
            >
              <div className="flex items-center mb-4 md:mb-8">
                <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl md:rounded-2xl flex items-center justify-center mr-3 md:mr-4 shadow-lg">
                  <svg className="w-4 h-4 md:w-6 md:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg md:text-2xl font-bold text-gray-900">Categorias</h3>
              </div>
              
              <div className="space-y-2 md:space-y-3">
                {categories.map((category) => (
                  <motion.button
                    key={category}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full text-left px-3 py-2 md:px-6 md:py-4 rounded-xl md:rounded-2xl transition-all duration-300 font-medium text-sm md:text-base ${
                      selectedCategory === category
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:shadow-md'
                    }`}
                  >
                    {category}
                  </motion.button>
                ))}
              </div>

              {/* Estatísticas Premium */}
              <div className="mt-6 md:mt-10 pt-4 md:pt-8 border-t border-gray-200">
                <h4 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-6 flex items-center">
                  <svg className="w-4 h-4 md:w-5 md:h-5 mr-2 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Estatísticas
                </h4>
                <div className="space-y-2 md:space-y-4">
                  <div className="flex justify-between items-center p-2 md:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg md:rounded-xl">
                    <span className="text-gray-700 font-medium text-xs md:text-sm">Total de vídeos:</span>
                    <span className="font-bold text-indigo-600 text-sm md:text-lg">{videoLessons.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 md:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg md:rounded-xl">
                    <span className="text-gray-700 font-medium text-xs md:text-sm">Concluídos:</span>
                    <span className="font-bold text-green-600 text-sm md:text-lg">{completedVideos}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 md:p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg md:rounded-xl">
                    <span className="text-gray-700 font-medium text-xs md:text-sm">Restantes:</span>
                    <span className="font-bold text-orange-600 text-sm md:text-lg">{videoLessons.length - completedVideos}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Main Content - Lista de Vídeos Premium */}
          <div className="lg:w-3/4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="grid gap-4 md:gap-8"
            >
              {filteredVideos.map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1 * index }}
                  className="bg-white/90 backdrop-blur-xl rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden border border-white/20"
                >
                  {/* Header do Vídeo */}
                  <div className="p-4 md:p-6 pb-3 md:pb-4">
                    <div className="flex items-start md:items-center mb-3 md:mb-4">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg md:rounded-xl flex items-center justify-center mr-2 md:mr-3 shadow-lg flex-shrink-0">
                        <span className="text-white font-bold text-xs md:text-sm">{video.id}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 leading-tight">
                          {video.title}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1 md:mt-0">
                          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-2 py-1 md:px-3 md:py-1 rounded-full text-xs font-bold">
                            {video.category}
                          </span>
                          {video.isCompleted && (
                            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-1.5 md:p-2 rounded-full">
                              <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-3 md:mb-4">
                      {video.description}
                    </p>
                    
                    <div className="flex items-center text-xs md:text-sm text-gray-500">
                      <span className="flex items-center mr-4">
                        <svg className="w-3 h-3 md:w-4 md:h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        {video.duration}
                      </span>
                    </div>
                  </div>

                  {/* Player do YouTube Integrado */}
                  <div className="relative">
                    {playingVideo === video.id ? (
                      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                        <iframe
                          className="absolute top-0 left-0 w-full h-full"
                          src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0&modestbranding=1&showinfo=0&controls=1&fs=1&enablejsapi=1`}
                          title={video.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          onLoad={() => {
                            // Marcar como assistido quando o iframe carrega
                            handleVideoPlay(video.youtubeId);
                          }}
                          onClick={() => {
                            // Marcar como assistido quando clica no iframe
                            handlePlayClick(video.youtubeId);
                          }}
                        />
                      </div>
                    ) : (
                      <div className="relative group cursor-pointer" onClick={() => {
                        setPlayingVideo(video.id);
                        // Marcar como assistido quando clica no play
                        handlePlayClick(video.youtubeId);
                      }}>
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-48 md:h-64 object-cover"
                        />
                        
                        {/* Overlay com botão de play */}
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors duration-300">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-16 h-16 md:w-20 md:h-20 bg-red-600 rounded-full flex items-center justify-center shadow-2xl"
                          >
                            <svg className="w-6 h-6 md:w-8 md:h-8 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                          </motion.div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Status do vídeo */}
                  <div className="mt-4 text-center">
                    {isVideoWatched(video.youtubeId) ? (
                      <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-lg font-semibold text-sm">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>✓ Assistido</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-semibold text-sm">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                        <span>▶️ Clique para assistir</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
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
        className="fixed bottom-6 right-6 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-40"
      >
        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
        </svg>
      </motion.a>
    </div>
  )
}

export default Recursos
