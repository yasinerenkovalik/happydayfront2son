// Google Analytics ve Performance Monitoring

// Google Analytics 4 (GA4) kurulumu
export const initGA = (measurementId) => {
  if (typeof window !== 'undefined' && measurementId) {
    // Google Analytics script'ini yükle
    const script1 = document.createElement('script')
    script1.async = true
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
    document.head.appendChild(script1)

    // gtag fonksiyonunu tanımla
    window.dataLayer = window.dataLayer || []
    function gtag() {
      window.dataLayer.push(arguments)
    }
    window.gtag = gtag

    gtag('js', new Date())
    gtag('config', measurementId, {
      page_title: document.title,
      page_location: window.location.href,
      send_page_view: true
    })
  }
}

// Sayfa görüntüleme tracking
export const trackPageView = (url, title) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'GA_MEASUREMENT_ID', {
      page_title: title,
      page_location: url
    })
  }
}

// Event tracking
export const trackEvent = (action, category, label, value) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value
    })
  }
}

// Organizasyon detay görüntüleme
export const trackOrganizationView = (organizationId, organizationTitle, price) => {
  trackEvent('view_item', 'organization', organizationTitle, price)
  
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'view_item', {
      currency: 'TRY',
      value: price,
      items: [{
        item_id: organizationId,
        item_name: organizationTitle,
        category: 'organization',
        price: price
      }]
    })
  }
}

// İletişim formu gönderimi
export const trackContactForm = (organizationId, organizationTitle) => {
  trackEvent('generate_lead', 'contact', organizationTitle)
  
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'generate_lead', {
      currency: 'TRY',
      value: 1,
      items: [{
        item_id: organizationId,
        item_name: organizationTitle,
        category: 'contact_form'
      }]
    })
  }
}

// Arama tracking
export const trackSearch = (searchTerm, resultsCount) => {
  trackEvent('search', 'organization_search', searchTerm, resultsCount)
}

// Performance monitoring
export const trackPerformance = () => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0]
        
        if (perfData) {
          // Core Web Vitals tracking
          trackEvent('timing_complete', 'performance', 'page_load_time', Math.round(perfData.loadEventEnd - perfData.fetchStart))
          trackEvent('timing_complete', 'performance', 'dom_content_loaded', Math.round(perfData.domContentLoadedEventEnd - perfData.fetchStart))
          trackEvent('timing_complete', 'performance', 'first_contentful_paint', Math.round(perfData.responseEnd - perfData.fetchStart))
        }
      }, 0)
    })
  }
}

// Yandex Metrica kurulumu
export const initYandexMetrica = (counterId) => {
  if (typeof window !== 'undefined' && counterId) {
    (function(m,e,t,r,i,k,a){
      m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
      m[i].l=1*new Date();
      k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
    })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

    window.ym(counterId, "init", {
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true,
      webvisor: true
    })
  }
}

// Facebook Pixel kurulumu
export const initFacebookPixel = (pixelId) => {
  if (typeof window !== 'undefined' && pixelId) {
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');

    window.fbq('init', pixelId)
    window.fbq('track', 'PageView')
  }
}

// Hotjar kurulumu
export const initHotjar = (hjid, hjsv) => {
  if (typeof window !== 'undefined' && hjid) {
    (function(h,o,t,j,a,r){
      h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
      h._hjSettings={hjid:hjid,hjsv:hjsv};
      a=o.getElementsByTagName('head')[0];
      r=o.createElement('script');r.async=1;
      r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
      a.appendChild(r);
    })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
  }
}