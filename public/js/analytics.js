// Debug mode
const DEBUG = true;
const DOMAIN = 'dropshipping.amsync.online';

// Espera o carregamento do gtag
function initAnalytics() {
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    window.gtag = gtag;
    
    gtag('js', new Date());
    gtag('config', 'AW-17497994749');
}

// Função helper para rastrear eventos
function trackEvent(category, action, label) {
    if (window.gtag) {
        window.gtag('event', action, {
            'event_category': category,
            'event_label': label
        });
    }
}

// Função para rastrear visualização de página
function trackPageView() {
    gtag('event', 'conversion', {
        'send_to': 'AW-17497994749/hl6sCIivlKkbEP3r2JdB'
    });
    if (DEBUG) console.log('Analytics: Page view conversion tracked');
}

// Função para rastrear conversão com callback
function gtag_report_conversion(url) {
    var callback = function () {
        if (typeof(url) != 'undefined') {
            window.location = url;
        }
    };
    gtag('event', 'conversion', {
        'send_to': 'AW-17497994749/hl6sCIivlKkbEP3r2JdB',
        'event_callback': callback
    });
    if (DEBUG) console.log('Analytics: Conversion tracked');
    return false;
}

// Adiciona verificação de conexão
function checkAnalytics() {
    if (typeof gtag === 'function') {
        console.log('Analytics: gtag is loaded and working');
        return true;
    }
    console.error('Analytics: gtag is not loaded');
    return false;
}

// Inicializa quando o documento estiver pronto
if (document.readyState === 'complete') {
    initAnalytics();
} else {
    window.addEventListener('load', () => {
        initAnalytics();
        setTimeout(checkAnalytics, 2000); // Verifica após 2 segundos
    });
}
