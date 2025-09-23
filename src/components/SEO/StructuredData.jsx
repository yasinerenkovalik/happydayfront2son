import { useEffect } from 'react'

const StructuredData = ({ type = 'organization', data = {} }) => {
  useEffect(() => {
    const getStructuredData = () => {
      switch (type) {
        case 'organization':
          return {
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "MutluGünüm",
            "description": "Profesyonel organizasyon ve etkinlik hizmetleri",
            "url": "https://mutlugunum.com",
            "telephone": "+90-555-123-4567",
            "email": "info@mutlugunum.com",
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "TR",
              "addressLocality": "İstanbul",
              "addressRegion": "İstanbul"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "41.0082",
              "longitude": "28.9784"
            },
            "openingHours": [
              "Mo-Fr 09:00-18:00",
              "Sa 10:00-16:00"
            ],
            "priceRange": "₺₺",
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "reviewCount": "150",
              "bestRating": "5",
              "worstRating": "1"
            },
            "sameAs": [
              "https://instagram.com/mutlugunum",
              "https://facebook.com/mutlugunum"
            ],
            "serviceArea": {
              "@type": "GeoCircle",
              "geoMidpoint": {
                "@type": "GeoCoordinates",
                "latitude": "41.0082",
                "longitude": "28.9784"
              },
              "geoRadius": "50000"
            },
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Organizasyon Hizmetleri",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Düğün Organizasyonu",
                    "description": "Profesyonel düğün organizasyon hizmetleri"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Doğum Günü Organizasyonu",
                    "description": "Unutulmaz doğum günü partileri"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Kurumsal Etkinlik",
                    "description": "Profesyonel kurumsal etkinlik organizasyonu"
                  }
                }
              ]
            }
          }

        case 'event':
          return {
            "@context": "https://schema.org",
            "@type": "Event",
            "name": data.title || "Organizasyon Etkinliği",
            "description": data.description || "Profesyonel organizasyon hizmeti",
            "image": data.image || "/og-image.jpg",
            "startDate": data.startDate || new Date().toISOString(),
            "location": {
              "@type": "Place",
              "name": data.locationName || "MutluGünüm Organizasyon",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "TR",
                "addressLocality": data.city || "İstanbul"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": data.latitude || "41.0082",
                "longitude": data.longitude || "28.9784"
              }
            },
            "organizer": {
              "@type": "Organization",
              "name": "MutluGünüm",
              "url": "https://mutlugunum.com"
            },
            "offers": {
              "@type": "Offer",
              "price": data.price || "0",
              "priceCurrency": "TRY",
              "availability": "https://schema.org/InStock",
              "url": data.url || "https://mutlugunum.com"
            }
          }

        case 'breadcrumb':
          return {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": data.breadcrumbs?.map((item, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "name": item.name,
              "item": item.url
            })) || []
          }

        default:
          return {}
      }
    }

    const structuredData = getStructuredData()
    
    // Remove existing structured data script
    const existingScript = document.querySelector('script[data-structured-data]')
    if (existingScript) {
      existingScript.remove()
    }

    // Add new structured data script
    if (Object.keys(structuredData).length > 0) {
      const script = document.createElement('script')
      script.type = 'application/ld+json'
      script.setAttribute('data-structured-data', type)
      script.textContent = JSON.stringify(structuredData)
      document.head.appendChild(script)
    }

    return () => {
      // Cleanup on unmount
      const script = document.querySelector(`script[data-structured-data="${type}"]`)
      if (script) {
        script.remove()
      }
    }
  }, [type, data])

  return null
}

export default StructuredData