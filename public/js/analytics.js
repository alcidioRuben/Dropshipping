window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'AW-17497994749');

// Função helper para rastrear eventos
function trackEvent(category, action, label) {
    gtag('event', action, {
        'event_category': category,
        'event_label': label
    });
}
