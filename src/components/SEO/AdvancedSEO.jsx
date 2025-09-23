import { useEffect } from 'react'
import SEOHead from './SEOHead'
import StructuredData from './StructuredData'

const AdvancedSEO = ({ 
  page = 'home',
  title,
  description,
  keywords,
  image,
  url,
  breadcrumbs = [],
  organizationData = {},
  eventData = {}
}) => {
  
  // Sayfa bazlı SEO ayarları
  const getPageSEO = () => {
    switch (page) {
      case 'home':
        return {
          title: "MutluGünüm - Profesyonel Organizasyon ve Etkinlik Hizmetleri | İstanbul",
          description: "✨ Türkiye'nin en güvenilir organizasyon şirketi! Düğün, doğum günü, nişan, kına, kurumsal etkinlik organizasyonları. Profesyonel hizmet, uygun fiyat. İstanbul, Ankara, İzmir'de hizmet.",
          keywords: "organizasyon, düğün organizasyonu, doğum günü organizasyonu, etkinlik organizasyonu, parti organizasyonu, kurumsal etkinlik, nişan organizasyonu, kına organizasyonu, İstanbul organizasyon, Ankara organizasyon, İzmir organizasyon, profesyonel organizatör, etkinlik planlama, organizasyon şirketi, düğün planlama, parti planlama, en iyi organizasyon şirketi",
          url: "https://mutlugunum.com.tr/"
        }
      
      case 'services':
        return {
          title: "Organizasyon Hizmetlerimiz - Düğün, Doğum Günü, Kurumsal Etkinlik | MutluGünüm",
          description: "🎉 Profesyonel organizasyon hizmetleri: Düğün organizasyonu, doğum günü partileri, kurumsal etkinlikler, nişan, kına gecesi. Uygun fiyat, kaliteli hizmet garantisi.",
          keywords: "organizasyon hizmetleri, düğün organizasyonu fiyatları, doğum günü organizasyonu, kurumsal etkinlik organizasyonu, nişan organizasyonu, kına gecesi organizasyonu, parti organizasyonu, etkinlik planlama hizmetleri",
          url: "https://mutlugunum.com.tr/services"
        }
      
      case 'contact':
        return {
          title: "İletişim - MutluGünüm Organizasyon | Teklif Alın",
          description: "📞 MutluGünüm organizasyon ile iletişime geçin. Ücretsiz teklif alın, hayallerinizdeki organizasyonu planlayalım. İstanbul, Ankara, İzmir'de hizmet.",
          keywords: "organizasyon iletişim, organizasyon teklif, düğün organizasyonu teklif, doğum günü organizasyonu iletişim, kurumsal etkinlik teklif, organizasyon fiyat teklifi",
          url: "https://mutlugunum.com.tr/contact"
        }
      
      case 'organization-detail':
        return {
          title: organizationData.title ? `${organizationData.title} - MutluGünüm Organizasyon` : "Organizasyon Detayı - MutluGünüm",
          description: organizationData.description || "Profesyonel organizasyon hizmetleri detayları. Kaliteli hizmet, uygun fiyat, müşteri memnuniyeti garantisi.",
          keywords: `${organizationData.type || 'organizasyon'}, ${organizationData.city || 'İstanbul'} organizasyon, profesyonel organizatör, etkinlik planlama`,
          url: `https://mutlugunum.com.tr/organization/${organizationData.id || ''}`
        }
      
      default:
        return {
          title: "MutluGünüm - Profesyonel Organizasyon Hizmetleri",
          description: "Profesyonel organizasyon ve etkinlik hizmetleri",
          keywords: "organizasyon, etkinlik, düğün, doğum günü",
          url: "https://mutlugunum.com.tr"
        }
    }
  }

  const seoData = {
    ...getPageSEO(),
    ...{ title, description, keywords, image, url }
  }

  useEffect(() => {
    // Google Analytics gtag
    if (typeof gtag !== 'undefined') {
      gtag('config', 'GA_MEASUREMENT_ID', {
        page_title: seoData.title,
        page_location: seoData.url
      })
    }

    // Yandex Metrica
    if (typeof ym !== 'undefined') {
      ym(12345678, 'hit', seoData.url, {
        title: seoData.title
      })
    }
  }, [seoData.title, seoData.url])

  return (
    <>
      <SEOHead {...seoData} />
      
      {/* Ana organizasyon structured data */}
      <StructuredData type="organization" />
      
      {/* Website structured data */}
      <StructuredData type="website" />
      
      {/* FAQ structured data ana sayfada */}
      {page === 'home' && <StructuredData type="faq" />}
      
      {/* Breadcrumb structured data */}
      {breadcrumbs.length > 0 && (
        <StructuredData 
          type="breadcrumb" 
          data={{ breadcrumbs }} 
        />
      )}
      
      {/* Event structured data */}
      {eventData && Object.keys(eventData).length > 0 && (
        <StructuredData 
          type="event" 
          data={eventData} 
        />
      )}
    </>
  )
}

export default AdvancedSEO