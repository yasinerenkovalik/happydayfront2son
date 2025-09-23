import { useEffect } from 'react'

const SEOHead = ({ 
  title = "MutluGünüm - Profesyonel Organizasyon ve Etkinlik Hizmetleri",
  description = "Düğün, doğum günü, kurumsal etkinlik organizasyonları. Profesyonel hizmet, uygun fiyat. Hayallerinizdeki organizasyonu gerçekleştirin.",
  keywords = "organizasyon, düğün, doğum günü, etkinlik, parti, kurumsal etkinlik, İstanbul, Ankara, İzmir",
  image = "/og-image.jpg",
  url = "https://mutlugunum.com.tr",
  type = "website"
}) => {
  useEffect(() => {
    // Title
    document.title = title

    // Meta tags
    const updateMetaTag = (name, content, property = false) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`
      let meta = document.querySelector(selector)
      
      if (!meta) {
        meta = document.createElement('meta')
        if (property) {
          meta.setAttribute('property', name)
        } else {
          meta.setAttribute('name', name)
        }
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', content)
    }

    // Basic meta tags
    updateMetaTag('description', description)
    updateMetaTag('keywords', keywords)
    updateMetaTag('author', 'MutluGünüm')

    // Open Graph tags
    updateMetaTag('og:title', title, true)
    updateMetaTag('og:description', description, true)
    updateMetaTag('og:image', image, true)
    updateMetaTag('og:url', url, true)
    updateMetaTag('og:type', type, true)
    updateMetaTag('og:site_name', 'MutluGünüm', true)

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image')
    updateMetaTag('twitter:title', title)
    updateMetaTag('twitter:description', description)
    updateMetaTag('twitter:image', image)

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', url)

  }, [title, description, keywords, image, url, type])

  return null
}

export default SEOHead