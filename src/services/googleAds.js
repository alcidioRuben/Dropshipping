// Serviço para integração com Google Ads
const GOOGLE_ADS_CONVERSION_ID = 'AW-17497994749'
const GOOGLE_ADS_CONVERSION_LABEL = 'hl6sCIivlKkbEP3r2JdB'

/**
 * Serviço para rastreamento de conversões do Google Ads
 */
class GoogleAdsService {
  constructor() {
    this.conversionId = GOOGLE_ADS_CONVERSION_ID
    this.conversionLabel = GOOGLE_ADS_CONVERSION_LABEL
    this.isInitialized = false
    this.init()
  }

  /**
   * Inicializa o serviço
   */
  init() {
    if (typeof window !== 'undefined' && window.gtag) {
      this.isInitialized = true
      console.log('✅ Google Ads inicializado com sucesso')
    } else {
      console.warn('⚠️ Google Ads (gtag) não está disponível')
      // Tentar novamente após um delay
      setTimeout(() => {
        if (typeof window !== 'undefined' && window.gtag) {
          this.isInitialized = true
          console.log('✅ Google Ads inicializado com sucesso (retry)')
        }
      }, 2000)
    }
  }

  /**
   * Verifica se o gtag está disponível
   */
  isAvailable() {
    return this.isInitialized && typeof window !== 'undefined' && typeof window.gtag === 'function'
  }

  /**
   * Rastreia uma conversão do Google Ads
   * @param {Object} options - Opções da conversão
   * @param {string} options.transactionId - ID da transação (opcional)
   * @param {number} options.value - Valor da conversão (opcional)
   * @param {string} options.currency - Moeda (padrão: 'MZN')
   * @param {Function} options.callback - Callback após conversão (opcional)
   */
  trackConversion(options = {}) {
    if (!this.isAvailable()) {
      console.warn('⚠️ Google Ads não disponível para rastrear conversão')
      return false
    }

    try {
      const conversionParams = {
        'send_to': `${this.conversionId}/${this.conversionLabel}`,
        ...(options.transactionId && { 'transaction_id': options.transactionId }),
        ...(options.value && { 'value': options.value }),
        ...(options.currency && { 'currency': options.currency || 'MZN' })
      }

      if (options.callback) {
        conversionParams['event_callback'] = options.callback
      }

      window.gtag('event', 'conversion', conversionParams)
      console.log('✅ Conversão Google Ads rastreada:', conversionParams)
      return true
    } catch (error) {
      console.error('❌ Erro ao rastrear conversão Google Ads:', error)
      return false
    }
  }

  /**
   * Rastreia evento personalizado
   * @param {string} eventName - Nome do evento
   * @param {Object} parameters - Parâmetros do evento
   */
  trackEvent(eventName, parameters = {}) {
    if (!this.isAvailable()) {
      console.warn(`⚠️ Google Ads não disponível para evento: ${eventName}`)
      return
    }

    try {
      window.gtag('event', eventName, parameters)
      console.log(`✅ Evento Google Ads rastreado: ${eventName}`, parameters)
    } catch (error) {
      console.error(`❌ Erro ao rastrear evento Google Ads ${eventName}:`, error)
    }
  }

  /**
   * Rastreia visualização de página
   * @param {string} pagePath - Caminho da página (opcional)
   * @param {string} pageTitle - Título da página (opcional)
   */
  trackPageView(pagePath = null, pageTitle = null) {
    if (!this.isAvailable()) {
      console.warn('⚠️ Google Ads não disponível para rastrear pageview')
      return
    }

    try {
      const config = {
        'page_path': pagePath || window.location.pathname,
        ...(pageTitle && { 'page_title': pageTitle })
      }

      window.gtag('config', this.conversionId, config)
      console.log('✅ PageView Google Ads rastreado:', config)
    } catch (error) {
      console.error('❌ Erro ao rastrear PageView Google Ads:', error)
    }
  }

  /**
   * Eventos específicos para o curso de dropshipping
   */

  // Visualização da página inicial
  trackHomePageView() {
    this.trackPageView('/')
    this.trackEvent('page_view', {
      'page_title': 'Home - Curso de Dropshipping',
      'page_location': window.location.href
    })
  }

  // Início do checkout (clicou em comprar)
  trackInitiateCheckout(value = 299, currency = 'MZN') {
    this.trackEvent('begin_checkout', {
      'value': value,
      'currency': currency,
      'items': [{
        'item_id': 'curso-dropshipping',
        'item_name': 'Curso Completo de Dropshipping',
        'category': 'Digital Course',
        'quantity': 1,
        'price': value
      }]
    })
  }

  // Compra concluída
  trackPurchase(transactionId, value = 299, currency = 'MZN') {
    this.trackConversion({
      transactionId,
      value,
      currency
    })

    this.trackEvent('purchase', {
      'transaction_id': transactionId,
      'value': value,
      'currency': currency,
      'items': [{
        'item_id': 'curso-dropshipping',
        'item_name': 'Curso Completo de Dropshipping',
        'category': 'Digital Course',
        'quantity': 1,
        'price': value
      }]
    })
  }

  // Registro/login bem-sucedido
  trackRegistration(method = 'email') {
    this.trackEvent('sign_up', {
      'method': method
    })
  }

  // Clique em CTA
  trackCTAClick(buttonText, location) {
    this.trackEvent('click', {
      'event_category': 'CTA',
      'event_label': buttonText,
      'location': location
    })
  }

  // Visualização de conteúdo
  trackViewContent(contentName, contentType = 'course') {
    this.trackEvent('view_item', {
      'items': [{
        'item_id': 'curso-dropshipping',
        'item_name': contentName,
        'item_category': contentType
      }]
    })
  }

  // Envio de formulário
  trackFormSubmit(formName) {
    this.trackEvent('generate_lead', {
      'form_name': formName
    })
  }

  // Contato via WhatsApp
  trackWhatsAppClick() {
    this.trackEvent('contact', {
      'contact_type': 'whatsapp'
    })
  }

  // Visualização de vídeo
  trackVideoView(videoTitle) {
    this.trackEvent('video_view', {
      'video_title': videoTitle
    })
  }

  // Scroll profundo (75%+)
  trackDeepScroll() {
    this.trackEvent('scroll', {
      'percent_scrolled': 75
    })
  }

  // Tempo na página (30+ segundos)
  trackTimeOnPage(seconds) {
    this.trackEvent('timing_complete', {
      'name': 'page_time',
      'value': seconds
    })
  }
}

// Exportar instância única (Singleton)
const googleAdsService = new GoogleAdsService()
export default googleAdsService

