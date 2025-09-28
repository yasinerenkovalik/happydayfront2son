import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import useOrganizationDetail from '../hooks/useOrganizationDetail'
import ImageGallery from '../components/ImageGallery/ImageGallery'
import SimpleLocationPicker from '../components/Map/SimpleLocationPicker'
import { getImageUrl, getApiUrl } from '../utils/api'

const OrganizationDetail = () => {
  const { id } = useParams()
  const { organization, loading, error } = useOrganizationDetail(id)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    guests: '',
    message: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')

  const [galleryOpen, setGalleryOpen] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitMessage('')

    try {
      // FormData oluştur
      const formDataToSend = new FormData()
      formDataToSend.append('FullName', formData.name)
      formDataToSend.append('Phone', formData.phone)
      formDataToSend.append('Email', formData.email)
      formDataToSend.append('Message', `Davetli Sayısı: ${formData.guests}\n\n${formData.message}`)
      formDataToSend.append('OrganizationId', organization.id)

      // API'ye gönder
      const response = await fetch(getApiUrl('/ContactMessage/add'), {
        method: 'POST',
        body: formDataToSend
      })

      if (response.ok) {
        setSubmitMessage('Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.')
        setFormData({
          name: '',
          email: '',
          phone: '',
          guests: '',
          message: ''
        })
      } else {
        throw new Error('Mesaj gönderilemedi')
      }
    } catch (error) {
      console.error('Form gönderme hatası:', error)
      setSubmitMessage('Mesaj gönderilirken bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // getImageUrl artık utils/api.js'den geliyor

  const formatPrice = (price) => {
    if (!price || isNaN(price)) return '₺0'
    return `₺${price.toLocaleString('tr-TR')}`
  }

  // Tüm resimleri bir array'de topla
  const allImages = useMemo(() => {
    if (!organization) return []

    const images = []

    // Ana kapak fotoğrafını ekle
    if (organization.coverPhotoPath) {
      images.push(getImageUrl(organization.coverPhotoPath))
    }

    // Diğer fotoğrafları ekle
    if (organization.images && organization.images.length > 0) {
      organization.images.forEach(image => {
        images.push(getImageUrl(image.imageUrl))
      })
    }

    return images
  }, [organization])

  const openGallery = (index) => {
    setSelectedImageIndex(index)
    setGalleryOpen(true)
  }

  const closeGallery = () => {
    setGalleryOpen(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-subtle-light dark:text-subtle-dark">Organizasyon detayları yükleniyor...</p>
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

  if (!organization) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-subtle-light dark:text-subtle-dark">Organizasyon bulunamadı.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">

        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-4xl font-extrabold tracking-tight text-content-light dark:text-content-dark">
              {organization.title}
            </h1>

            {/* Company Profile Button */}
            {organization.companyId && (
              <div className="mt-4">
                <Link 
                  to={`/company/${organization.companyId}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors duration-200"
                >
                  <span className="material-symbols-outlined text-sm">business</span>
                  <span className="font-medium">Şirket Profili</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            )}

            <div className="mt-2 flex items-center gap-4 text-subtle-light dark:text-subtle-dark">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">location_on</span>
                <span className="text-sm font-medium">{organization.cityName}, {organization.districtName}</span>
              </div>
              {organization.maxGuestCount && (
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">group</span>
                  <span className="text-sm font-medium">{organization.maxGuestCount} kişi</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">schedule</span>
                <span className="text-sm font-medium">{organization.duration}</span>
              </div>
            </div>
          </div>

          {/* Image Gallery */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 rounded-xl overflow-hidden mb-8">
            {/* Ana kapak fotoğrafı */}
            <div
              className="col-span-2 row-span-2 relative group cursor-pointer"
              onClick={() => openGallery(0)}
            >
              <img
                alt={organization.title}
                className="w-full h-full object-cover hover:opacity-90 transition-all duration-300 group-hover:scale-105"
                src={getImageUrl(organization.coverPhotoPath)}
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
                }}
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center pointer-events-none">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/20 backdrop-blur-sm rounded-full p-3">
                  <span className="material-symbols-outlined text-white text-2xl">zoom_in</span>
                </div>
              </div>
            </div>

            {/* Diğer fotoğraflar */}
            {organization.images && organization.images.length > 0 ? (
              organization.images.slice(0, 4).map((image, index) => (
                <div
                  key={image.id}
                  className="relative group cursor-pointer"
                  onClick={() => openGallery(index + 1)}
                >
                  <img
                    alt={`${organization.title} - Fotoğraf ${index + 1}`}
                    className="w-full h-full object-cover hover:opacity-90 transition-all duration-300 group-hover:scale-105"
                    src={getImageUrl(image.imageUrl)}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
                    }}
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center pointer-events-none">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/20 backdrop-blur-sm rounded-full p-2">
                      <span className="material-symbols-outlined text-white">zoom_in</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Fallback görseller
              Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span className="material-symbols-outlined text-gray-400">image</span>
                </div>
              ))
            )}

            {/* Daha fazla fotoğraf varsa overlay */}
            {organization.images && organization.images.length > 4 && (
              <div
                className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium cursor-pointer hover:bg-black/80 transition-colors"
                onClick={() => openGallery(0)}
              >
                +{organization.images.length - 4} fotoğraf
              </div>
            )}
          </div>
            {/* Price */}
          <div className="mb-8">
            <div className="relative overflow-hidden">
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-primary animate-pulse rounded-2xl"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent rounded-2xl"></div>

              {/* Content */}
              <div className="relative p-8 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="material-symbols-outlined text-white text-2xl">payments</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">
                        Organizasyon Fiyatı
                      </h3>
                      <p className="text-white/80 mt-1 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        {organization.duration} için
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg">
                      <span className="text-4xl font-black text-white drop-shadow-lg">
                        {formatPrice(organization.price)}
                      </span>
                      <p className="text-white/80 text-sm mt-1">Kurulum dahil</p>
                    </div>
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
              </div>
            </div>
          </div>

          {/* Services */}
          {organization.services && organization.services.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="material-symbols-outlined text-white">verified</span>
                </div>
                <h2 className="text-2xl font-bold text-content-light dark:text-content-dark">
                  Sunulan Hizmetler
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {organization.services.map((service, index) => (
                  <div
                    key={index}
                    className="group relative overflow-hidden bg-gradient-to-br from-background-light to-background-light/50 dark:from-background-dark dark:to-background-dark/50 p-5 rounded-xl border border-border-light/50 dark:border-border-dark/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    <div className="relative flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <span className="material-symbols-outlined text-green-600 dark:text-green-400">check_circle</span>
                      </div>
                      <span className="font-semibold text-content-light dark:text-content-dark group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">
                        {service}
                      </span>
                    </div>

                    {/* Decorative element */}
                    <div className="absolute top-2 right-2 w-8 h-8 bg-gradient-to-br from-green-500/10 to-transparent rounded-full blur-sm"></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reservation & Cancel Policy */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {organization.reservationNote && (
              <div className="relative overflow-hidden group">
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-blue-400/5 to-transparent rounded-2xl"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-blue-500/10 rounded-2xl"></div>

                <div className="relative bg-blue-50/80 dark:bg-blue-900/30 backdrop-blur-sm rounded-2xl p-6 border border-blue-200/50 dark:border-blue-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <span className="material-symbols-outlined text-white">event_note</span>
                    </div>
                    <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100">
                      Rezervasyon Bilgileri
                    </h3>
                  </div>
                  <p className="text-blue-800 dark:text-blue-200 leading-relaxed font-medium">
                    {organization.reservationNote}
                  </p>

                  {/* Decorative elements */}
                  <div className="absolute top-3 right-3 w-16 h-16 bg-blue-500/10 rounded-full blur-xl"></div>
                </div>
              </div>
            )}

            {organization.cancelPolicy && (
              <div className="relative overflow-hidden group">
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-orange-400/5 to-transparent rounded-2xl"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-orange-500/10 rounded-2xl"></div>

                <div className="relative bg-orange-50/80 dark:bg-orange-900/30 backdrop-blur-sm rounded-2xl p-6 border border-orange-200/50 dark:border-orange-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <span className="material-symbols-outlined text-white">policy</span>
                    </div>
                    <h3 className="text-xl font-bold text-orange-900 dark:text-orange-100">
                      İptal Politikası
                    </h3>
                  </div>
                  <p className="text-orange-800 dark:text-orange-200 leading-relaxed font-medium">
                    {organization.cancelPolicy}
                  </p>

                  {/* Decorative elements */}
                  <div className="absolute top-3 right-3 w-16 h-16 bg-orange-500/10 rounded-full blur-xl"></div>
                </div>
              </div>
            )}
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent rounded-2xl"></div>
              <div className="relative bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm p-6 rounded-2xl border border-border-light/50 dark:border-border-dark/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <span className="material-symbols-outlined text-white text-xl">
                      {organization.isOutdoor ? 'park' : 'home'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-content-light dark:text-content-dark">
                    Mekan Türü
                  </h3>
                </div>
                <p className="text-subtle-light dark:text-subtle-dark font-semibold text-lg">
                  {organization.isOutdoor ? 'Açık Alan' : 'Kapalı Mekan'}
                </p>
                <div className="absolute top-3 right-3 w-12 h-12 bg-purple-500/10 rounded-full blur-lg"></div>
              </div>
            </div>

            <div className="group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-2xl"></div>
              <div className="relative bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm p-6 rounded-2xl border border-border-light/50 dark:border-border-dark/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <span className="material-symbols-outlined text-white text-xl">schedule</span>
                  </div>
                  <h3 className="text-lg font-bold text-content-light dark:text-content-dark">
                    Süre
                  </h3>
                </div>
                <p className="text-subtle-light dark:text-subtle-dark font-semibold text-lg">
                  {organization.duration}
                </p>
                <div className="absolute top-3 right-3 w-12 h-12 bg-indigo-500/10 rounded-full blur-lg"></div>
              </div>
            </div>

            <div className="group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-2xl"></div>
              <div className="relative bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm p-6 rounded-2xl border border-border-light/50 dark:border-border-dark/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <span className="material-symbols-outlined text-white text-xl">group</span>
                  </div>
                  <h3 className="text-lg font-bold text-content-light dark:text-content-dark">
                    Kapasite
                  </h3>
                </div>
                <p className="text-subtle-light dark:text-subtle-dark font-semibold text-lg">
                  {organization.maxGuestCount ? `${organization.maxGuestCount} kişi` : 'Belirtilmemiş'}
                </p>
                <div className="absolute top-3 right-3 w-12 h-12 bg-emerald-500/10 rounded-full blur-lg"></div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <div className="relative">
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 rounded-2xl"></div>

              {/* Content */}
              <div className="relative bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-border-light/50 dark:border-border-dark/50">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="material-symbols-outlined text-white text-xl">description</span>
                  </div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-content-light to-primary bg-clip-text text-transparent dark:from-content-dark dark:to-primary">
                    Organizasyon Detayları
                  </h2>
                </div>

                <div className="prose prose-lg max-w-none">
                  <div className="text-content-light/80 dark:text-content-dark/80 leading-relaxed text-lg whitespace-pre-line font-medium">
                    {organization.description}
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-xl"></div>
                <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-tr from-primary/5 to-transparent rounded-full blur-lg"></div>
              </div>
            </div>
          </div>

        

          {/* Konum Haritası */}
          {organization.latitude && organization.longitude && (
            <div className="mb-8">
              <div className="relative">
                {/* Gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-red-500/10 rounded-2xl"></div>

                {/* Content */}
                <div className="relative bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-border-light/50 dark:border-border-dark/50">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="material-symbols-outlined text-white text-xl">location_on</span>
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-content-light to-red-500 bg-clip-text text-transparent dark:from-content-dark dark:to-red-500">
                      Konum Bilgileri
                    </h2>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-border-light dark:border-border-dark">
                    <SimpleLocationPicker
                      latitude={organization.latitude}
                      longitude={organization.longitude}
                      onLocationChange={() => { }} // Read-only, değişiklik yapılamaz
                      disabled={true}
                    />
                  </div>

                
               

                

                  {/* Harici Harita Linkleri */}
              

                  {/* Decorative elements */}
                  <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-red-500/10 to-transparent rounded-full blur-xl"></div>
                  <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-tr from-red-500/5 to-transparent rounded-full blur-lg"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Quote Form */}
        <div className="lg:col-span-1">
          <div className="sticky top-28">
            <div className="bg-background-light dark:bg-background-dark p-6 rounded-xl border border-border-light dark:border-border-dark shadow-lg">
              <h2 className="text-xl font-bold mb-4 text-center">Teklif Alın</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-subtle-light dark:text-subtle-dark mb-1"
                  >
                    Adınız Soyadınız
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Adınız Soyadınız"
                    className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-md bg-background-light dark:bg-background-dark focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-subtle-light dark:text-subtle-dark mb-1"
                  >
                    E-posta Adresiniz
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="ornek@mail.com"
                    className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-md bg-background-light dark:bg-background-dark focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-subtle-light dark:text-subtle-dark mb-1"
                  >
                    Telefon Numaranız
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="555 123 4567"
                    className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-md bg-background-light dark:bg-background-dark focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>



                <div>
                  <label
                    htmlFor="guests"
                    className="block text-sm font-medium text-subtle-light dark:text-subtle-dark mb-1"
                  >
                    Davetli Sayısı
                  </label>
                  <input
                    id="guests"
                    name="guests"
                    type="number"
                    min="1"
                    value={formData.guests}
                    onChange={handleInputChange}
                    placeholder="Yaklaşık davetli sayısı"
                    className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-md bg-background-light dark:bg-background-dark focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-subtle-light dark:text-subtle-dark mb-1"
                  >
                    Mesajınız
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="4"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Eklemek istediğiniz detayları veya sorularınızı yazabilirsiniz."
                    className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-md bg-background-light dark:bg-background-dark focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {submitMessage && (
                  <div className={`p-3 rounded-md text-sm ${submitMessage.includes('başarıyla')
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                    {submitMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary text-white font-bold py-3 px-4 rounded-full hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Gönderiliyor...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">send</span>
                      <span>Teklif Gönder</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Image Gallery Modal */}
      <ImageGallery
        images={allImages}
        isOpen={galleryOpen}
        onClose={closeGallery}
        initialIndex={selectedImageIndex}
      />
    </div>
  )
}

export default OrganizationDetail