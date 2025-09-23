import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getApiUrl, getImageUrl } from '../../utils/api'
import { useCities, useCategories } from '../../hooks/useFilterData'

const FeaturedOrganizations = () => {
  const [featuredOrgs, setFeaturedOrgs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(0) // 0 = tüm kategoriler

  const { categories } = useCategories()

  useEffect(() => {
    fetchFeaturedOrganizations()
  }, [selectedCategory])

  const fetchFeaturedOrganizations = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(getApiUrl('/Organization/GetFeatured'), {
        method: 'POST',
        headers: {
          'Accept': 'text/plain',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedCategory
        })
      })

      if (!response.ok) {
        throw new Error('Öne çıkan organizasyonlar yüklenemedi')
      }

      const result = await response.json()
      if (result.isSuccess) {
        setFeaturedOrgs(result.data || [])
      } else {
        throw new Error(result.message || 'Öne çıkan organizasyonlar yüklenemedi')
      }
    } catch (err) {
      setError(err.message)
      setFeaturedOrgs([])
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price) => {
    if (!price || isNaN(price)) return '₺0'
    return `₺${price.toLocaleString('tr-TR')}`
  }

  const truncateDescription = (description, maxLength = 100) => {
    if (!description || typeof description !== 'string') return 'Açıklama mevcut değil'
    if (description.length <= maxLength) return description
    return description.substring(0, maxLength) + '...'
  }

  return (
    <section className="bg-gradient-soft py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-content-light dark:text-content-dark mb-4">
            Öne Çıkan Organizasyonlar
          </h2>
          <p className="text-lg text-subtle-light dark:text-subtle-dark max-w-2xl mx-auto">
            En popüler ve kaliteli organizasyonları keşfedin
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <button
            onClick={() => setSelectedCategory(0)}
            className={`px-6 py-3 rounded-full font-medium transition-all duration-200 hover-lift ${selectedCategory === 0
              ? 'bg-accent text-white shadow-accent'
              : 'bg-background-light text-content-light hover:bg-primary/20 border border-border-light shadow-soft'
              }`}
          >
            Tümü
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-200 hover-lift ${selectedCategory === category.id
                ? 'bg-accent text-white shadow-accent'
                : 'bg-background-light text-content-light hover:bg-primary/20 border border-border-light shadow-soft'
                }`}
            >
              {category.categoryName || category.name}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
              <p className="mt-4 text-subtle-light dark:text-subtle-dark">Organizasyonlar yükleniyor...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">Hata: {error}</p>
            <button
              onClick={fetchFeaturedOrganizations}
              className="px-6 py-3 bg-accent text-white rounded-full hover:bg-accent-dark transition-colors shadow-accent hover-lift"
            >
              Tekrar Dene
            </button>
          </div>
        )}

        {/* Organizations Grid */}
        {!loading && !error && (
          <>
            {featuredOrgs.length === 0 ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-6xl text-subtle-light dark:text-subtle-dark mb-4 block">
                  event_busy
                </span>
                <h3 className="text-xl font-medium text-content-light dark:text-content-dark mb-2">
                  Bu kategoride öne çıkan organizasyon bulunamadı
                </h3>
                <p className="text-subtle-light dark:text-subtle-dark">
                  Diğer kategorileri deneyebilir veya tüm organizasyonları görüntüleyebilirsiniz.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {featuredOrgs.map((org) => (
                  <div
                    key={org.id}
                    className="group bg-background-light dark:bg-background-dark rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                  >
                    {/* Image */}
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={getImageUrl(org.coverPhotoPath)}
                        alt={org.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
                        }}
                      />

                      {/* Price Badge */}
                      <div className="absolute top-4 right-4 bg-accent text-white px-3 py-1 rounded-full text-sm font-bold shadow-accent">
                        {formatPrice(org.price)}
                      </div>

                      {/* Outdoor Badge */}
                      {org.isOutdoor && (
                        <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                          Açık Alan
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="font-bold text-lg text-content-light dark:text-content-dark mb-2 line-clamp-2">
                        {org.title || 'Başlık Yok'}
                      </h3>

                      <p className="text-sm text-subtle-light dark:text-subtle-dark mb-4 line-clamp-3">
                        {truncateDescription(org.description)}
                      </p>

                      {/* Location & Capacity */}
                      <div className="flex items-center gap-4 text-xs text-subtle-light dark:text-subtle-dark mb-4">
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">location_on</span>
                          <span>{org.cityName}, {org.districtName}</span>
                        </div>
                        {org.maxGuestCount && (
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">group</span>
                            <span>{org.maxGuestCount} kişi</span>
                          </div>
                        )}
                      </div>

                      {/* Duration Badge */}
                      {org.duration && (
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-accent mb-4">
                          <span className="material-symbols-outlined text-sm mr-1">schedule</span>
                          {org.duration}
                        </div>
                      )}

                      {/* CTA Button */}
                      <Link
                        to={`/organization/${org.id}`}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors group-hover:shadow-lg"
                      >
                        Detayları Gör
                        <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                          arrow_forward
                        </span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* View All Button */}
            {featuredOrgs.length > 0 && (
              <div className="text-center mt-12">
                <Link
                  to="/services"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark font-semibold rounded-full border-2 border-primary hover:bg-primary hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Tüm Organizasyonları Gör
                  <span className="material-symbols-outlined">explore</span>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}

export default FeaturedOrganizations