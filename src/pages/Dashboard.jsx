import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PageLoadingSpinner } from '../components/LoadingSpinner';
import metaPixelService from '../services/metaPixel';

const Dashboard = () => {
  const { currentUser, userProfile, saveCourseProgress, loadCourseProgress } = useAuth();
  const navigate = useNavigate();
  const [selectedModule, setSelectedModule] = useState(0);
  const [selectedLesson, setSelectedLesson] = useState(0);
  const [watchedVideos, setWatchedVideos] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Módulos do curso baseados nos novos vídeos
  const modules = [
    {
      id: 1,
      title: "Fundamentos",
      description: "Conceitos básicos e preparação para o sucesso",
      lessons: [
        {
          id: 1,
          title: "1. Introdução",
          duration: "11:41",
          videoUrl: "https://www.youtube.com/embed/TDnkzEpC2Dk",
          youtubeId: "TDnkzEpC2Dk",
          completed: true
        },
        {
          id: 2,
          title: "2. Decisão",
          duration: "3:05",
          videoUrl: "https://www.youtube.com/embed/PTtN-gnI0Xg",
          youtubeId: "PTtN-gnI0Xg",
          completed: true
        },
        {
          id: 3,
          title: "3. Ambiente",
          duration: "7:05",
          videoUrl: "https://www.youtube.com/embed/o17IkxNd0TI",
          youtubeId: "o17IkxNd0TI",
          completed: false
        }
      ]
    },
    {
      id: 2,
      title: "Mentalidade",
      description: "Desenvolva a mentalidade necessária para o sucesso",
      lessons: [
        {
          id: 4,
          title: "4. Mente Milionária",
          duration: "11:24",
          videoUrl: "https://www.youtube.com/embed/xAY8KUxTIqw",
          youtubeId: "xAY8KUxTIqw",
          completed: false
        }
      ]
    },
    {
      id: 3,
      title: "Estratégia",
      description: "Estratégias para gerar renda e construir riqueza",
      lessons: [
        {
          id: 5,
          title: "5. Forma de Fazer Dinheiro",
          duration: "7:34",
          videoUrl: "https://www.youtube.com/embed/EEIQVQUHADU",
          youtubeId: "EEIQVQUHADU",
          completed: false
        },
        {
          id: 6,
          title: "6. Modelo de Negócio",
          duration: "7:23",
          videoUrl: "https://www.youtube.com/embed/ymiYya34ras",
          youtubeId: "ymiYya34ras",
          completed: false
        }
      ]
    },
    {
      id: 4,
      title: "Aceleração",
      description: "Como acelerar o crescimento e obter resultados",
      lessons: [
        {
          id: 7,
          title: "7. Velocidade",
          duration: "2:33",
          videoUrl: "https://www.youtube.com/embed/T7v9YcXlOG8",
          youtubeId: "T7v9YcXlOG8",
          completed: false
        }
      ]
    },
    {
      id: 5,
      title: "Implementação",
      description: "Como implementar tudo na prática",
      lessons: [
        {
          id: 8,
          title: "8. Como Vai Funcionar o Nosso Negócio",
          duration: "5:02",
          videoUrl: "https://www.youtube.com/embed/JeVV-Py7A-Q",
          youtubeId: "JeVV-Py7A-Q",
          completed: false
        }
      ]
    },
    {
      id: 6,
      title: "Facebook & WhatsApp",
      description: "Configuração e gestão de anúncios no Facebook",
      lessons: [
        {
          id: 9,
          title: "9. Configurar Baixar Facebook WhatsApp e Gestor de Anúncio",
          duration: "5:59",
          videoUrl: "https://www.youtube.com/embed/-Vi3TZY0zdE",
          youtubeId: "-Vi3TZY0zdE",
          completed: false
        },
        {
          id: 10,
          title: "10. Criação de Loja e Logo",
          duration: "7:12",
          videoUrl: "https://www.youtube.com/embed/-X1dh4mFbuI",
          youtubeId: "-X1dh4mFbuI",
          completed: false
        },
        {
          id: 11,
          title: "11. Configuração do Facebook",
          duration: "7:11",
          videoUrl: "https://www.youtube.com/embed/AuP3RJZZyIQ",
          youtubeId: "AuP3RJZZyIQ",
          completed: false
        },
        {
          id: 12,
          title: "12. Criação de Anúncio",
          duration: "3:38",
          videoUrl: "https://www.youtube.com/embed/jrLstvfbIYs",
          youtubeId: "jrLstvfbIYs",
          completed: false
        },
        {
          id: 13,
          title: "13. Configuração do Gestor de Anúncio",
          duration: "6:00",
          videoUrl: "https://www.youtube.com/embed/pIHN1rMcYrc",
          youtubeId: "pIHN1rMcYrc",
          completed: false
        },
        {
          id: 14,
          title: "14. Direcionamento do Público Alvo",
          duration: "9:21",
          videoUrl: "https://www.youtube.com/embed/5RsEGikCaCs",
          youtubeId: "5RsEGikCaCs",
          completed: false
        },
        {
          id: 15,
          title: "15. Adicionando Dados Bancários",
          duration: "6:30",
          videoUrl: "https://www.youtube.com/embed/3RxeobirXbo",
          youtubeId: "3RxeobirXbo",
          completed: false
        },
        {
          id: 16,
          title: "16. Configuração de Últimos Detalhes",
          duration: "6:16",
          videoUrl: "https://www.youtube.com/embed/8PKzDqeXz8o",
          youtubeId: "8PKzDqeXz8o",
          completed: false
        }
      ]
    }
  ];

  // Carregar progresso salvo do Firebase
  useEffect(() => {
    const loadProgress = async () => {
      if (currentUser) {
        try {
          const result = await loadCourseProgress();
          if (result.success && result.data) {
            setWatchedVideos(result.data);
            console.log('Progresso carregado do Firebase:', result.progressInfo);
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

  // Sincronizar selectedLesson quando mudamos de módulo
  useEffect(() => {
  const currentModule = modules[selectedModule];
    if (currentModule && selectedLesson >= currentModule.lessons.length) {
      setSelectedLesson(0);
    }
  }, [selectedModule, selectedLesson, modules]);

  // Simular carregamento rápido da página
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500) // 500ms para dashboard

    return () => clearTimeout(timer)
  }, [])

  // Meta Pixel - Rastrear visualização do dashboard
  useEffect(() => {
    metaPixelService.trackDashboardView();
  }, [])

  if (isLoading) {
    return <PageLoadingSpinner text="Carregando painel..." />
  }

  const currentModule = modules[selectedModule] || modules[0];
  
  // Garantir que selectedLesson não exceda o número de aulas disponíveis
  const maxLessons = currentModule?.lessons?.length || 0;
  const safeSelectedLesson = selectedLesson >= maxLessons ? 0 : selectedLesson;
  const currentLesson = currentModule?.lessons[safeSelectedLesson] || currentModule?.lessons[0];

  const totalLessons = modules.reduce((acc, module) => acc + module.lessons.length, 0);
  const completedLessons = modules.reduce((acc, module) => 
    acc + module.lessons.filter(lesson => isVideoWatched(lesson.youtubeId)).length, 0
  );
  const progressPercentage = Math.round((completedLessons / totalLessons) * 100);

  // Verificação de segurança para evitar erros
  if (!currentModule || !currentLesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando conteúdo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Badge Premium */}
          <div className="flex justify-center mb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full text-black font-bold text-sm shadow-lg"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span> MEMBRO PREMIUM</span>
            </motion.div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Área do Aluno
              </h1>
              <p className="text-gray-600">
                Bem-vindo, <span className="font-semibold text-blue-600">
                  {userProfile?.name || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Aluno'}
                </span>! 👋
              </p>
              <div className="flex items-center mt-2">
                <span className="text-sm text-green-600 font-medium">✓ Acesso Premium Ativo</span>
                <span className="mx-2 text-gray-300">•</span>
                <span className="text-sm text-purple-600 font-medium">🎯 Conteúdo Exclusivo</span>
              </div>
            </div>
            <div className="text-center md:text-right">
              <div className="text-sm text-gray-600">Progresso do Curso</div>
              <div className="text-2xl font-bold text-blue-600">
                {progressPercentage}%
              </div>
            </div>
          </div>
          
          {/* Barra de Progresso */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>{completedLessons} de {totalLessons} aulas concluídas</span>
              <span>{progressPercentage}% completo</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full"
              />
            </div>
          </div>

          {/* Botão de Acesso aos Recursos */}
          <div className="mt-6 text-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/recursos')}
              className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center space-x-3 mx-auto relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 animate-pulse"></div>
              <svg className="w-6 h-6 relative z-10" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              <span className="relative z-10">Ver Todo o Curso Premium</span>
            </motion.button>
            <p className="text-sm text-gray-500 mt-2">
              <span className="text-purple-600 font-medium">✨ Acesso Exclusivo:</span> Todos os 16 vídeos organizados por categoria
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar - Lista de Módulos */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Módulos do Curso
              </h2>
              
              <div className="space-y-4">
                {modules.map((module, moduleIndex) => (
                  <motion.div
                    key={module.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: moduleIndex * 0.1 }}
                  >
                    <button
                      onClick={() => {
                        setSelectedModule(moduleIndex);
                        setSelectedLesson(0); // Reset para primeira aula do módulo
                      }}
                      className={`w-full text-left p-4 rounded-xl transition-all duration-300 ${
                        selectedModule === moduleIndex
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{module.title}</h3>
                        <span className="text-sm opacity-75">
                          {module.lessons.filter(l => isVideoWatched(l.youtubeId)).length}/{module.lessons.length}
                        </span>
                      </div>
                      <p className={`text-sm ${
                        selectedModule === moduleIndex ? 'text-blue-100' : 'text-gray-600'
                      }`}>
                        {module.description}
                      </p>
                    </button>

                    {/* Lista de Aulas do Módulo */}
                    {selectedModule === moduleIndex && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 ml-4 space-y-2"
                      >
                        {module.lessons.map((lesson, lessonIndex) => (
                          <button
                            key={lesson.id}
                            onClick={() => setSelectedLesson(lessonIndex)}
                            className={`w-full text-left p-3 rounded-lg transition-all duration-300 flex items-center space-x-3 ${
                              safeSelectedLesson === lessonIndex
                                ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-600'
                                : 'hover:bg-gray-50 text-gray-600'
                            }`}
                          >
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              isVideoWatched(lesson.youtubeId)
                                ? 'bg-green-500 text-white' 
                                : 'bg-gray-300 text-gray-600'
                            }`}>
                              {isVideoWatched(lesson.youtubeId) ? (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <span className="text-xs font-bold">{lesson.id}</span>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{lesson.title}</div>
                              <div className="text-sm opacity-75">{lesson.duration}</div>
                            </div>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Conteúdo Principal - Vídeo e Materiais */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              {/* Header da Aula */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">
                      {currentLesson.title}
                    </h2>
                    <p className="text-blue-100">
                      Módulo {selectedModule + 1}: {currentModule.title}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-blue-100">Duração</div>
                    <div className="text-xl font-bold">{currentLesson.duration}</div>
                  </div>
                </div>
                
                {/* Navegação entre aulas */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => {
                      if (selectedLesson > 0) {
                        setSelectedLesson(selectedLesson - 1);
                      } else if (selectedModule > 0) {
                        setSelectedModule(selectedModule - 1);
                        setSelectedLesson(modules[selectedModule - 1].lessons.length - 1);
                      }
                    }}
                    disabled={selectedModule === 0 && selectedLesson === 0}
                    className="flex items-center space-x-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Aula Anterior</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      if (selectedLesson < currentModule.lessons.length - 1) {
                        setSelectedLesson(selectedLesson + 1);
                      } else if (selectedModule < modules.length - 1) {
                        setSelectedModule(selectedModule + 1);
                        setSelectedLesson(0);
                      }
                    }}
                    disabled={selectedModule === modules.length - 1 && selectedLesson === currentModule.lessons.length - 1}
                    className="flex items-center space-x-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>Próxima Aula</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Player de Vídeo */}
              <div className="p-6">
                <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden mb-6 shadow-2xl">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${currentLesson.youtubeId}?rel=0&modestbranding=1&showinfo=0&controls=1&fs=1&enablejsapi=1`}
                    title={currentLesson.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    onLoad={() => {
                      // Marcar como assistido quando o iframe carrega
                      handleVideoPlay(currentLesson.youtubeId);
                    }}
                    onClick={() => {
                      // Marcar como assistido quando clica no iframe
                      handlePlayClick(currentLesson.youtubeId);
                    }}
                  />
                </div>

                                {/* Status do vídeo */}
                <div className="mb-6 text-center">
                  {isVideoWatched(currentLesson.youtubeId) ? (
                    <div className="inline-flex items-center px-6 py-3 bg-green-100 text-green-800 rounded-xl font-semibold">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                      <span>✓ Vídeo Assistido</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center px-6 py-3 bg-blue-100 text-blue-800 rounded-xl font-semibold">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                          </svg>
                      <span>▶️ Clique para assistir</span>
                    </div>
                  )}
                </div>



                {/* Notas da Aula */}
                <div className="mt-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Sobre Esta Aula
                  </h3>
                  <div className="prose prose-lg max-w-none text-gray-700">
                    <p>
                      Esta é a aula {currentLesson.id} do curso completo de Dropshipping. 
                      Aqui você aprenderá conceitos essenciais para transformar sua vida financeira 
                      através do empreendedorismo digital.
                    </p>
                    <ul>
                      <li>Assista o vídeo completo para absorver todo o conteúdo</li>
                      <li>Anote os pontos principais que mais chamaram sua atenção</li>
                      <li>Pratique os exercícios e estratégias apresentadas</li>
                      <li>Continue para a próxima aula quando estiver pronto</li>
                    </ul>
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      <p className="text-blue-800 font-medium">
                        💡 <strong>Dica:</strong> Para acessar todos os vídeos do curso de forma organizada, 
                        clique no botão "Ver Todos os Recursos" no topo da página.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Seção Premium - Benefícios Exclusivos */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden">
          {/* Elementos decorativos */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
          
          <div className="relative z-10">
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full text-white font-bold text-lg mb-4"
              >
                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                VOCÊ É MEMBRO PREMIUM
              </motion.div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Benefícios Exclusivos do Seu Plano
              </h2>
              <p className="text-xl text-purple-100 max-w-2xl mx-auto">
                Aproveite todos os recursos premium disponíveis para membros VIP como você
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center"
              >
                <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4zM14 13h-3v3H9v-3H6v-2h3V8h2v3h3v2z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">16 Vídeos Exclusivos</h3>
                <p className="text-purple-100">Acesso completo a todo o conteúdo premium do curso</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center"
              >
                <div className="w-16 h-16 bg-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Materiais de Apoio</h3>
                <p className="text-purple-100">Downloads exclusivos e recursos complementares</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center"
              >
                <div className="w-16 h-16 bg-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Suporte Prioritário</h3>
                <p className="text-purple-100">Atendimento VIP para membros premium</p>
              </motion.div>
            </div>

            <div className="text-center mt-8">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                <span className="text-lg font-semibold">Status: Ativo • </span>
              </motion.div>
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
  );
};

export default Dashboard;
