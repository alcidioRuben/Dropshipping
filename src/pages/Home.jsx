import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PageLoadingSpinner } from '../components/LoadingSpinner';
import BotaoCTA from '../components/BotaoCTA';
import CardDepoimento from '../components/CardDepoimento';
import metaPixelService from '../services/metaPixel';
import googleAdsService from '../services/googleAds';

const Home = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [newComment, setNewComment] = useState('');
  const [userComments, setUserComments] = useState([]);
  const [userRating, setUserRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);

  // Função auxiliar para converter ID do Google Drive em URL de imagem
  const getDriveImageUrl = (fileId) => {
    // Formato ideal para imagens do Google Drive: thumbnail com tamanho otimizado para perfil
    // Usa formato w400-h400 para garantir qualidade e proporção quadrada (ideal para avatares)
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w400-h400`;
  };

  // Função para tentar formatos alternativos em caso de erro
  const handleImageError = (e, fileId) => {
    const currentSrc = e.target.src;
    
    // Tentar diferentes formatos do Google Drive
    if (currentSrc.includes('thumbnail')) {
      // Se thumbnail falhar, tentar formato de visualização
      e.target.src = `https://drive.google.com/uc?export=view&id=${fileId}`;
    } else if (currentSrc.includes('uc?export=view')) {
      // Se visualização falhar, tentar formato de download
      e.target.src = `https://drive.google.com/uc?export=download&id=${fileId}`;
    } else {
      // Se tudo falhar, usar placeholder com inicial do nome
      const parent = e.target.parentElement;
      const name = parent?.nextElementSibling?.querySelector('h3')?.textContent || 'U';
      e.target.style.display = 'none';
      if (parent) {
        parent.innerHTML = `
          <div class="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mr-4">
            <span class="text-white font-bold text-lg">${name.charAt(0)}</span>
          </div>
        `;
      }
    }
  };

  // Simular carregamento rápido da página
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 300) // 300ms para home (mais rápido)

    return () => clearTimeout(timer)
  }, [])

  // Meta Pixel e Google Ads - Rastrear visualização da página inicial
  useEffect(() => {
    // Meta Pixel
    metaPixelService.trackHomePageView();
    metaPixelService.trackCourseInterest();
    
    // Google Ads
    googleAdsService.trackHomePageView();
    googleAdsService.trackViewContent('Curso Completo de Dropshipping', 'course');
    
    // Rastrear tempo na página após 30 segundos
    const timeTracker = setTimeout(() => {
      metaPixelService.trackTimeOnPage();
      googleAdsService.trackTimeOnPage(30);
    }, 30000);

    // Rastrear scroll profundo
    let scrollTracked = false;
    const handleScroll = () => {
      const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercentage > 75 && !scrollTracked) {
        scrollTracked = true;
        metaPixelService.trackDeepScroll();
        googleAdsService.trackDeepScroll();
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      clearTimeout(timeTracker);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [])

  // Carregar comentários do localStorage
  useEffect(() => {
    const savedComments = localStorage.getItem('userComments');
    if (savedComments) {
      try {
        const parsedComments = JSON.parse(savedComments);
        setUserComments(parsedComments);
        console.log('Comentários carregados do localStorage:', parsedComments);
      } catch (error) {
        console.error('Erro ao carregar comentários do localStorage:', error);
        setUserComments([]);
      }
    }
  }, []);

  if (isLoading) {
    return <PageLoadingSpinner text="Carregando página inicial..." />
  }

  const benefits = [
    {
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: "Aprenda do Zero",
      description: "Metodologia passo a passo para iniciantes"
    },
    {
      icon: (
        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      title: "Baixo Investimento",
      description: "Comece com pouco dinheiro e escale"
    },
    {
      icon: (
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Suporte Completo",
      description: "Acompanhamento personalizado 24/7"
    },
    {
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Acesso Vitalício",
      description: "Conteúdo atualizado constantemente, sem custos adicionais"
    }
  ];

  const testimonials = [
    {
      name: "João Silva",
      role: "Estudante",
      content: "Transformei minha vida financeira com este curso. Em 2 semanas já estava lucrando!",
      image: getDriveImageUrl("1r0n08n6W4-vUMAB2M7GxWJmKLC5B4rW_"),
      rating: 5
    },
    {
      name: "Maria Santos",
      role: "Estudante",
      content: "Consegui criar uma renda extra trabalhando de casa. O curso é incrível!",
      image: getDriveImageUrl("19Zi5kAJBFrq7ztK9ETTPunSk7oqPQUxp"),
      rating: 5
    },
    {
      name: "Carlos Oliveira",
      role: "Emprendedor",
      content: "Melhor investimento que fiz. Em 2 semanas já estava diferente!",
      image: getDriveImageUrl("1o-WfFxJH7kS24J4saTLmkCWhVXUgJRi9"),
      rating: 5
    },
    {
      name: "Aisha Johnson",
      role: "Campones",
      content: "Como africana, este curso me deu oportunidades que nunca imaginei!",
      image: getDriveImageUrl("1l38B6EpVLYETbQfF0N-7J14KPRl2Tm-V"),
      rating: 5
    },
    {
      name: "Kwame Mensah",
      role: "Consultor",
      content: "Em 2 semanas minha perspectiva mudou completamente. Recomendo!",
      image: getDriveImageUrl("1vK23T1AM_77yTuelwn10lCtys-D1tQ9K"),
      rating: 5
    },
    {
      name: "Julio Diallo",
      role: "Designer",
      content: "O curso me permitiu trabalhar de casa e cuidar da família. Gratidão!",
      image: getDriveImageUrl("1B3U_n-vFXfMULiEIDqdbYuuzW1xUrVvm"),
      rating: 5
    },
    {
      name: "Ana Costa",
      role: "Aluna",
      content: "Incrível como em pouco tempo consegui resultados reais. O suporte é excepcional!",
      image: getDriveImageUrl("1KJe7Ab34Nkm4KLUK-wuJNRWadGJ6SNMT"),
      rating: 5
    },
    {
      name: "Pedro Mendes",
      role: "Empreendedor",
      content: "Melhor decisão que tomei. Hoje tenho minha própria loja online funcionando perfeitamente!",
      image: getDriveImageUrl("1G1tkzdNaZxj12ruSoiREsEX2Ual9SJ5s"),
      rating: 5
    }
  ];

  const handleAddComment = () => {
    if (newComment.trim() && userRating > 0) {
      const comment = {
        id: Date.now(),
        content: newComment,
        date: new Date().toLocaleDateString('pt-BR'),
        name: "Usuário Anônimo",
        rating: userRating,
        isUserComment: true
      };
      
      const updatedComments = [...userComments, comment];
      setUserComments(updatedComments);
      localStorage.setItem('userComments', JSON.stringify(updatedComments));
      
      // Meta Pixel e Google Ads - Rastrear adição de comentário
      metaPixelService.trackCommentAdd(userRating);
      googleAdsService.trackEvent('comment_add', {
        'rating': userRating,
        'comment_length': newComment.length
      });
      
      // Log para debug
      console.log('Comentário adicionado:', comment);
      console.log('Comentários salvos no localStorage:', updatedComments);
      
      // Reset form
      setNewComment('');
      setUserRating(0);
      setHoveredRating(0);
      
      // Feedback visual de sucesso
      alert('Comentário enviado com sucesso! Obrigado pela sua avaliação! 🌟');
    }
  };

  // Função para limpar comentários (útil para testes)
  const clearUserComments = () => {
    setUserComments([]);
    localStorage.removeItem('userComments');
    console.log('Comentários limpos do localStorage');
  };

  // Ordenar comentários de usuários por data (mais recentes primeiro)
  const sortedUserComments = [...userComments].sort((a, b) => b.id - a.id);
  const allComments = [...testimonials, ...sortedUserComments];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50">
      {/* Banner de Destaque */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <span className="font-semibold text-base">
              Aula completa de Dropshipping que já ajudou centenas a ter sucesso!
            </span>
          </div>
        </div>
      </motion.div>

      {/* Hero Section */}
      <section className="pt-16 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Conteúdo Principal */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              <div className="mb-4">
                <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-3">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Curso Completo de Dropshipping
                </div>
              </div>

              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                Transforme sua vida com{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  Dropshipping
                </span>
              </h1>

              <p className="text-lg text-gray-600 mb-6 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Aprenda a criar uma loja online lucrativa do zero, sem estoque e com baixo investimento. 
                Metodologia comprovada que já transformou centenas de vidas.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <BotaoCTA 
                  to="/login" 
                  variant="gradient" 
                  size="lg"
                  className="text-base px-6 py-3"
                  onClick={() => {
                    metaPixelService.trackCTAClick('Quero começar agora', 'Hero Section');
                    googleAdsService.trackCTAClick('Quero começar agora', 'Hero Section');
                    googleAdsService.trackInitiateCheckout(299, 'MZN');
                  }}
                >
                  Quero começar agora
                </BotaoCTA>
                <BotaoCTA 
                  to="/sobre" 
                  variant="outline" 
                  size="lg"
                  className="text-base px-6 py-3"
                  onClick={() => {
                    metaPixelService.trackCTAClick('Saiba mais', 'Hero Section');
                    googleAdsService.trackCTAClick('Saiba mais', 'Hero Section');
                  }}
                >
                  Saiba mais
                </BotaoCTA>
              </div>

              <div className="mt-6 flex items-center justify-center lg:justify-start space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>637+ alunos formados</span>
                </div>
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>94% de sucesso</span>
                </div>
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>50+ aulas</span>
                </div>
              </div>
            </motion.div>

            {/* Vídeo Principal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative bg-white rounded-2xl p-8 shadow-2xl">
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    className="absolute top-0 left-0 w-full h-full rounded-xl"
                                        src="https://www.youtube.com/embed/TaQMJa3zmPU?rel=0&modestbranding=1&showinfo=0&controls=1&fs=1"
                                        title="Curso de Dropshipping - LacasaDigital"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        allowFullScreen
                                        onLoad={() => metaPixelService.trackVideoView('Vídeo Principal - Curso Dropshipping')}
                                      />
                </div>
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Por que escolher a LacasaDigital?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Metodologia comprovada que já transformou centenas de vidas
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <div className="mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              O que nossos alunos dizem
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Histórias reais de transformação em apenas 2 semanas
            </p>
            {userComments.length > 0 && (
              <div className="mt-4">
                <span className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {userComments.length} comentário{userComments.length !== 1 ? 's' : ''} de alunos
                </span>
              </div>
            )}
          </motion.div>

          <div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
            onMouseEnter={() => metaPixelService.trackTestimonialView()}
          >
            {allComments.slice(0, 8).map((testimonial, index) => (
              <motion.div
                key={testimonial.id || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 ${
                  testimonial.isUserComment ? 'border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-center mb-4">
                  {testimonial.isUserComment ? (
                    // Avatar padrão para comentários de usuários
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mr-4">
                      <span className="text-white font-bold text-lg">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                  ) : (
                    // Imagem para depoimentos padrão
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover mr-4 border-2 border-gray-200"
                      onError={(e) => {
                        // Extrair fileId da URL atual
                        const fileIdMatch = e.target.src.match(/id=([^&]+)/);
                        const fileId = fileIdMatch ? fileIdMatch[1] : null;
                        
                        if (fileId) {
                          handleImageError(e, fileId);
                        } else {
                          // Se não conseguir extrair fileId, usar placeholder
                          e.target.style.display = 'none';
                          const parent = e.target.parentElement;
                          if (parent) {
                            parent.innerHTML = `
                              <div class="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mr-4">
                                <span class="text-white font-bold text-lg">${testimonial.name.charAt(0)}</span>
                              </div>
                            `;
                          }
                        }
                      }}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">{testimonial.name}</h3>
                    <p className="text-sm text-gray-600">
                      {testimonial.isUserComment ? 'Aluno do Curso' : testimonial.role}
                    </p>
                    {testimonial.isUserComment && (
                      <p className="text-xs text-gray-500">{testimonial.date}</p>
                    )}
                  </div>
                </div>
                <p className="text-gray-700 mb-4">{testimonial.content}</p>
                {testimonial.rating && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg 
                          key={i} 
                          className={`w-4 h-4 ${
                            i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'
                          }`} 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    {testimonial.isUserComment && (
                      <span className="text-xs text-blue-600 font-medium">
                        ✓ Verificado
                      </span>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Sistema de Comentários */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                Deixe seu comentário e avaliação
              </h3>
              <div className="space-y-4">
                {/* Sistema de Estrelas */}
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Avalie o curso:</p>
                  <div className="flex justify-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setUserRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="text-2xl transition-colors duration-200"
                      >
                        <svg
                          className={`w-8 h-8 ${
                            star <= (hoveredRating || userRating)
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                  {userRating > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      {userRating === 1 && "Péssimo"}
                      {userRating === 2 && "Ruim"}
                      {userRating === 3 && "Regular"}
                      {userRating === 4 && "Bom"}
                      {userRating === 5 && "Excelente"}
                    </p>
                  )}
                </div>

                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Conte-nos sua experiência com o curso..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
                  rows={4}
                />
                <div className="flex justify-center">
                  <BotaoCTA
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || userRating === 0}
                    className="px-8 py-3"
                  >
                    Enviar Comentário
                  </BotaoCTA>
                </div>
                {userRating === 0 && (
                  <p className="text-sm text-red-500 text-center">
                    ⭐ Por favor, selecione uma avaliação com estrelas
                  </p>
                )}
                
                {/* Botão de debug para limpar comentários (apenas em desenvolvimento) */}
                {process.env.NODE_ENV === 'development' && userComments.length > 0 && (
                  <div className="text-center mt-4">
                    <button
                      onClick={clearUserComments}
                      className="text-xs text-gray-500 hover:text-red-500 underline"
                    >
                      🗑️ Limpar comentários (Debug)
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Seção de Preços */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Investimento Único, Resultados Para Sempre
            </h2>
            <p className="text-lg text-blue-100 mb-6">
              Acesso vitalício a todo o conteúdo, atualizações e suporte especializado
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-8 md:p-10 shadow-2xl"
          >
            <div className="mb-6">
              <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                 299 MT
              </div>
              <div className="text-lg text-gray-600"></div>
            </div>

            <div className="space-y-3 mb-8 text-left max-w-md mx-auto">
              {[
                "16 aulas em vídeo",
                "Materiais de apoio completos",
                "Suporte técnico 24/7",
                "Acesso vitalício",
                "Atualizações gratuitas",
                "Grupo exclusivo de alunos",
                "Consultoria individual"
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                  viewport={{ once: true }}
                  className="flex items-center space-x-2"
                >
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-700">{feature}</span>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <BotaoCTA 
                to="/login" 
                variant="gradient" 
                size="xl"
                className="w-full text-lg py-3"
                onClick={() => {
                  metaPixelService.trackCTAClick('Começar Agora', 'Pricing Section');
                  googleAdsService.trackCTAClick('Começar Agora', 'Pricing Section');
                  googleAdsService.trackInitiateCheckout(299, 'MZN');
                }}
              >
                Começar Agora
              </BotaoCTA>
              <p className="text-sm text-gray-500 mt-3">
                Risco zero: 30 dias de garantia incondicional
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Pronto para Transformar Sua Vida?
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Junte-se a milhares de alunos que já transformaram seus sonhos em realidade. 
              O momento é agora!
            </p>
            <BotaoCTA 
              to="/login" 
              variant="gradient" 
              size="xl"
              className="text-lg px-8 py-3"
              onClick={() => {
                metaPixelService.trackCTAClick('Quero começar agora', 'Final CTA');
                googleAdsService.trackCTAClick('Quero começar agora', 'Final CTA');
                googleAdsService.trackInitiateCheckout(299, 'MZN');
              }}
            >
              Quero começar agora
            </BotaoCTA>
          </motion.div>
        </div>
      </section>

      {/* Botão Flutuante do WhatsApp */}
      <motion.a
        href="https://wa.me/258874006962"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
        className="fixed bottom-6 right-6 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50"
        onClick={() => {
          metaPixelService.trackWhatsAppClick();
          googleAdsService.trackWhatsAppClick();
        }}
      >
        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
        </svg>
      </motion.a>
    </div>
  );
};

export default Home;
