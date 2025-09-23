import { useState, useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import useOrganizations from '../hooks/useOrganizations'
import { useCities, useDistricts, useCategories } from '../hooks/useFilterData'
import { getImageUrl } from '../utils/api'

const Services = () => {
  const [searchParams] = useSearchParams()

  const [filters, setFilters] = useState({
    cityId: '',
    districtId: '',
    categoryId: '',
    isOutdoor: undefined,
    maxPrice: 50000
  })

  const [debouncedFilters, setDebouncedFilters] = useState(filters)
  const [sortBy, setSortBy] = useState('Popülerliğe Göre')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 6

  // Debouncing için useEffect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters)
    }, 300) // 300ms debounce

    return () => clearTimeout(timer)
  }, [filters])

  // API hook'ları - debounced filters kullan
  const { organizations, loading, error, totalCount } = useOrganizations(currentPage, pageSize, debouncedFilters)
  const { cities } = useCities()
  const { districts } = useDistricts(filters.cityId)
  const { categories } = useCategories()

  // URL parametrelerini okuyup filtreleri ayarla
  useEffect(() => {
    const cityIdParam = searchParams.get('cityId')
    const districtIdParam = searchParams.get('districtId')
    const categoryIdParam = searchParams.get('categoryId')

    if (cityIdParam || districtIdParam || categoryIdParam) {
      setFilters(prev => ({
        ...prev,
        cityId: cityIdParam || '',
        districtId: districtIdParam || '',
        categoryId: categoryIdParam || ''
      }))
    }
  }, [searchParams])

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => {
      const newFilters = {
        ...prev,
        [filterType]: value
      }

      // Şehir değiştiğinde ilçeyi sıfırla
      if (filterType === 'cityId') {
        newFilters.districtId = ''
      }

      return newFilters
    })

    // Filtre değiştiğinde sayfa 1'e dön (sadece debounced filters değiştiğinde)
    if (filterType !== 'maxPrice') {
      setCurrentPage(1)
    }
  }

  const handleFilterSubmit = (e) => {
    e.preventDefault()
    // Filtreler otomatik olarak uygulanıyor (useEffect sayesinde)
  }

  const clearFilters = () => {
    const defaultFilters = {
      cityId: '',
      districtId: '',
      categoryId: '',
      isOutdoor: undefined,
      maxPrice: 50000
    }
    setFilters(defaultFilters)
    setDebouncedFilters(defaultFilters) // Hemen temizle
    setCurrentPage(1)
  }

  // getImageUrl artık utils/api.js'den geliyor

  const formatPrice = (price) => {
    if (!price || isNaN(price)) return '₺0'
    return `₺${price.toLocaleString('tr-TR')}`
  }

  const truncateDescription = (description, maxLength = 150) => {
    if (!description || typeof description !== 'string') return 'Açıklama mevcut değil'
    if (description.length <= maxLength) return description
    return description.substring(0, maxLength) + '...'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-subtle-light dark:text-subtle-dark">Organizasyonlar yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">Hata: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Hero Section */}
      <section className="py-16 sm:py-24 bg-background-light dark:bg-background-dark">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-content-light dark:text-content-dark">
              Organizasyonları Keşfet
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-base sm:text-lg text-subtle-light dark:text-subtle-dark">
              Hayallerinizi süsleyen, unutulmaz anılar biriktireceğiniz organizasyonlar burada.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 sm:py-24 bg-background-light/50 dark:bg-background-dark/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-12">

            {/* Sidebar Filters */}
            <aside className="w-full lg:w-1/4">
              <div className="sticky top-24">
                <div className="bg-background-light dark:bg-background-dark rounded-xl shadow-xl border border-border-light dark:border-border-dark p-6">
                  <h2 className="text-2xl font-bold text-content-light dark:text-content-dark mb-6">
                    Filtreler
                  </h2>

                  <form onSubmit={handleFilterSubmit} className="space-y-6">
                    {/* City Filter */}
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                        Şehir
                      </label>
                      <select
                        id="city"
                        name="city"
                        value={filters.cityId}
                        onChange={(e) => handleFilterChange('cityId', e.target.value)}
                        className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-md shadow-sm focus:ring-primary focus:border-primary text-content-light dark:text-content-dark"
                      >
                        <option value="">Tüm Şehirler</option>
                        {cities.map((city) => (
                          <option key={city.id} value={city.id}>
                            {city.cityName}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* District Filter */}
                    <div>
                      <label htmlFor="district" className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                        İlçe
                      </label>
                      <select
                        id="district"
                        name="district"
                        value={filters.districtId}
                        onChange={(e) => handleFilterChange('districtId', e.target.value)}
                        disabled={!filters.cityId}
                        className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-md shadow-sm focus:ring-primary focus:border-primary text-content-light dark:text-content-dark disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">Tüm İlçeler</option>
                        {districts.map((district) => (
                          <option key={district.id} value={district.id}>
                            {district.districtName || district.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Category Filter */}
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                        Kategori
                      </label>
                      <select
                        id="category"
                        name="category"
                        value={filters.categoryId}
                        onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                        className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-md shadow-sm focus:ring-primary focus:border-primary text-content-light dark:text-content-dark"
                      >
                        <option value="">Tüm Kategoriler</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.categoryName || category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Outdoor Filter */}
                    <div>
                      <label htmlFor="outdoor" className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                        Mekan Türü
                      </label>
                      <select
                        id="outdoor"
                        name="outdoor"
                        value={filters.isOutdoor === undefined ? '' : filters.isOutdoor.toString()}
                        onChange={(e) => {
                          const value = e.target.value === '' ? undefined : e.target.value === 'true'
                          handleFilterChange('isOutdoor', value)
                        }}
                        className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-md shadow-sm focus:ring-primary focus:border-primary text-content-light dark:text-content-dark"
                      >
                        <option value="">Tüm Mekanlar</option>
                        <option value="false">Kapalı Mekan</option>
                        <option value="true">Açık Mekan</option>
                      </select>
                    </div>

                    {/* Price Range Filter */}
                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                        Maksimum Fiyat: ₺{filters.maxPrice.toLocaleString('tr-TR')}
                      </label>
                      <input
                        id="price"
                        name="price"
                        type="range"
                        min="5000"
                        max="100000"
                        step="5000"
                        value={filters.maxPrice}
                        onChange={(e) => handleFilterChange('maxPrice', parseInt(e.target.value))}
                        className="w-full h-2 bg-border-light rounded-lg appearance-none cursor-pointer dark:bg-border-dark accent-primary"
                      />
                      <div className="flex justify-between text-sm text-subtle-light dark:text-subtle-dark mt-2">
                        <span>₺5.000</span>
                        <span>₺100.000+</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        className="flex-1 px-4 py-3 text-sm font-bold text-white bg-primary rounded-full hover:bg-primary/90 transition-colors shadow-lg"
                      >
                        Filtrele
                      </button>
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="px-4 py-3 text-sm font-bold text-primary bg-primary/10 rounded-full hover:bg-primary/20 transition-colors"
                      >
                        Temizle
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </aside>

            {/* Main Content Area */}
            <div className="w-full lg:w-3/4">
              {/* Results Header */}
              <div className="flex flex-col sm:flex-row items-center justify-between mb-8">
                <p className="text-subtle-light dark:text-subtle-dark mb-4 sm:mb-0">
                  {totalCount} organizasyon bulundu
                </p>

                <div className="flex items-center gap-4">
                  <label htmlFor="sort" className="text-sm font-medium text-content-light dark:text-content-dark">
                    Sırala:
                  </label>
                  <select
                    id="sort"
                    name="sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-md shadow-sm focus:ring-primary focus:border-primary text-content-light dark:text-content-dark pr-8"
                  >
                    <option>Popülerliğe Göre</option>
                    <option>Fiyata Göre (Artan)</option>
                    <option>Fiyata Göre (Azalan)</option>
                    <option>Tarihe Göre (En Yeni)</option>
                  </select>
                </div>
              </div>

              {/* Organizations Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {organizations.map((org) => (
                  <div key={org.id} className="bg-background-light dark:bg-background-dark rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden flex flex-col">
                    <div className="w-full h-48 overflow-hidden">
                      <img
                        alt={org.title}
                        className="w-full h-full object-cover"
                        src={getImageUrl(org.coverPhotoPath)}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
                        }}
                      />
                    </div>

                    <div className="p-6 flex flex-col flex-grow">
                      <h2 className="text-xl font-bold text-content-light dark:text-content-dark">
                        {org.title || 'Başlık Yok'}
                      </h2>
                      <div className="mt-2 flex items-center gap-4 text-sm text-subtle-light dark:text-subtle-dark">
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">location_on</span>
                          <span>{org.cityName || 'Şehir'}, {org.districtName || 'İlçe'}</span>
                        </div>
                        {org.maxGuestCount && (
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">group</span>
                            <span>{org.maxGuestCount} kişi</span>
                          </div>
                        )}
                      </div>

                      <p className="mt-4 text-content-light dark:text-content-dark flex-grow text-sm leading-relaxed">
                        {truncateDescription(org.description)}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {org.duration || 'Süre belirtilmemiş'}
                        </span>
                        {org.isOutdoor && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Açık Alan
                          </span>
                        )}
                      </div>

                      <div className="mt-6 flex items-center justify-between">
                        <span className="text-lg font-bold text-primary">
                          {formatPrice(org.price)}
                        </span>
                        <Link
                          to={`/organization/${org.id}`}
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-full hover:bg-primary/90 transition-colors"
                        >
                          Detaylar
                          <span className="material-symbols-outlined text-base">
                            arrow_forward
                          </span>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalCount > pageSize && (
                <nav aria-label="Pagination" className="mt-16 flex items-center justify-center">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-subtle-light dark:text-subtle-dark hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>

                  <div className="flex items-center gap-2 mx-4">
                    {Array.from({ length: Math.ceil(totalCount / pageSize) }, (_, i) => i + 1)
                      .slice(Math.max(0, currentPage - 3), currentPage + 2)
                      .map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm transition-colors ${currentPage === page
                            ? 'bg-primary text-white'
                            : 'bg-background-light dark:bg-background-dark text-subtle-light dark:text-subtle-dark hover:bg-primary/20'
                            }`}
                        >
                          {page}
                        </button>
                      ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalCount / pageSize)))}
                    disabled={currentPage === Math.ceil(totalCount / pageSize)}
                    className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-subtle-light dark:text-subtle-dark hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </nav>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Services