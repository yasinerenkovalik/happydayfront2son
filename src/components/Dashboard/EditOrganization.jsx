import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useCities, useDistricts, useCategories } from '../../hooks/useFilterData'
import { getApiUrl, getImageUrl } from '../../utils/api'
import ImageManager from './ImageManager'

const EditOrganization = ({ organizationId, onClose, onUpdate }) => {
  const { getAuthHeaders } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
    price: '',
    maxGuestCount: '',
    duration: '',
    categoryId: '',
    isOutdoor: false,
    coverPhoto: null,
    services: '',
    cancelPolicy: '',
    reservationNote: '',
    videoUrl: ''
  })

  const [currentImages, setCurrentImages] = useState({
    coverPhoto: null,
    galleryImages: []
  })

  const [showImageManager, setShowImageManager] = useState(false)



  // API'den verileri çek

  const { categories } = useCategories()

  useEffect(() => {
    if (organizationId) {
      fetchOrganizationDetails()
    }
  }, [organizationId])

  const fetchOrganizationDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(getApiUrl(`/Organization/GetOrganizationWithImages?Id=${organizationId}`), {
        method: 'GET',
        headers: {
          'Accept': 'text/plain',
          ...getAuthHeaders()
        }
      })

      if (!response.ok) {
        throw new Error('Organizasyon detayları yüklenemedi')
      }

      const result = await response.json()
      if (result.isSuccess && result.data) {
        const org = result.data
        setFormData({
          id: org.id,
          title: org.title || '',
          description: org.description || '',
          price: org.price || '',
          maxGuestCount: org.maxGuestCount || '',
          duration: org.duration || '',
          categoryId: org.categoryId || '',
          isOutdoor: org.isOutdoor || false,
          coverPhoto: null, // Yeni dosya seçilmediği sürece null
          services: org.services || '',
          cancelPolicy: org.cancelPolicy || '',
          reservationNote: org.reservationNote || '',
          videoUrl: org.videoUrl || ''
        })

        // Mevcut resimleri ayarla
        setCurrentImages({
          coverPhoto: org.coverPhotoPath || null,
          galleryImages: org.images || []
        })
      } else {
        throw new Error(result.message || 'Organizasyon detayları yüklenemedi')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target

    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: type === 'checkbox' ? checked :
          type === 'file' ? files[0] :
            value
      }



      return newData
    })

    // Mesajları temizle
    if (error) setError('')
    if (success) setSuccess(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)

    try {
      // FormData oluştur (dosya yükleme için)
      const submitData = new FormData()

      // Zorunlu alanlar
      submitData.append('Id', formData.id)
      submitData.append('Title', formData.title)
      submitData.append('Description', formData.description)
      submitData.append('Price', parseFloat(formData.price))
      submitData.append('MaxGuestCount', parseInt(formData.maxGuestCount))
      submitData.append('Duration', formData.duration)

      submitData.append('CategoryId', parseInt(formData.categoryId))
      submitData.append('IsOutdoor', formData.isOutdoor)

      // Opsiyonel alanlar
      submitData.append('Services', formData.services || '')
      submitData.append('CancelPolicy', formData.cancelPolicy || '')
      submitData.append('ReservationNote', formData.reservationNote || '')
      submitData.append('VideoUrl', formData.videoUrl || '')

      // Yeni kapak fotoğrafı seçildiyse ekle
      if (formData.coverPhoto) {
        submitData.append('CoverPhoto', formData.coverPhoto)
      }

      const response = await fetch(getApiUrl('/Organization/OrganizationUpdate'), {
        method: 'PUT',
        headers: {
          'Accept': 'text/plain',
          ...getAuthHeaders()
        },
        body: submitData
      })

      if (!response.ok) {
        throw new Error('Organizasyon güncellenemedi')
      }

      const result = await response.json()
      if (result.isSuccess) {
        setSuccess(true)
        // Parent component'i bilgilendir
        if (onUpdate) {
          onUpdate()
        }
        // 2 saniye sonra modal'ı kapat
        setTimeout(() => {
          onClose()
        }, 2000)
      } else {
        throw new Error(result.message || 'Organizasyon güncellenemedi')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // Resim yönetimi güncellendiğinde organizasyon detaylarını yeniden yükle
  const handleImagesUpdated = () => {
    fetchOrganizationDetails()
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-background-light dark:bg-background-dark rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-subtle-light dark:text-subtle-dark">Organizasyon yükleniyor...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background-light dark:bg-background-dark rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-light dark:border-border-dark">
          <h2 className="text-xl font-bold text-content-light dark:text-content-dark">
            Organizasyon Düzenle
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-background-light dark:hover:bg-background-dark rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-content-light dark:text-content-dark">
              close
            </span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg mb-6">
              Organizasyon başarıyla güncellendi! Modal kapatılıyor...
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Başlık */}
              <div className="md:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                  Organizasyon Başlığı *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  disabled={saving}
                  className="w-full px-4 py-3 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark disabled:opacity-50"
                  placeholder="Organizasyon başlığını girin"
                />
              </div>

              {/* Açıklama */}
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                  Açıklama *
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  disabled={saving}
                  className="w-full px-4 py-3 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark disabled:opacity-50"
                  placeholder="Organizasyon açıklamasını girin"
                />
              </div>

              {/* Fiyat */}
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                  Fiyat (₺) *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  disabled={saving}
                  className="w-full px-4 py-3 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark disabled:opacity-50"
                  placeholder="0.00"
                />
              </div>

              {/* Maksimum Misafir Sayısı */}
              <div>
                <label htmlFor="maxGuestCount" className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                  Maksimum Misafir Sayısı *
                </label>
                <input
                  type="number"
                  id="maxGuestCount"
                  name="maxGuestCount"
                  required
                  min="1"
                  value={formData.maxGuestCount}
                  onChange={handleChange}
                  disabled={saving}
                  className="w-full px-4 py-3 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark disabled:opacity-50"
                  placeholder="Misafir sayısı"
                />
              </div>

              {/* Süre */}
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                  Süre *
                </label>
                <input
                  type="text"
                  id="duration"
                  name="duration"
                  required
                  value={formData.duration}
                  onChange={handleChange}
                  disabled={saving}
                  className="w-full px-4 py-3 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark disabled:opacity-50"
                  placeholder="Örn: 4 saat, Tüm gün"
                />
              </div>



              {/* Kategori */}
              <div>
                <label htmlFor="categoryId" className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                  Kategori *
                </label>
                <select
                  id="categoryId"
                  name="categoryId"
                  required
                  value={formData.categoryId}
                  onChange={handleChange}
                  disabled={saving}
                  className="w-full px-4 py-3 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark disabled:opacity-50"
                >
                  <option value="">Kategori Seçin</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.categoryName || category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Hizmetler */}
              <div className="md:col-span-2">
                <label htmlFor="services" className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                  Hizmetler
                </label>
                <textarea
                  id="services"
                  name="services"
                  rows={3}
                  value={formData.services}
                  onChange={handleChange}
                  disabled={saving}
                  className="w-full px-4 py-3 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark disabled:opacity-50"
                  placeholder="Sunduğunuz hizmetleri açıklayın (opsiyonel)"
                />
              </div>

              {/* İptal Politikası */}
              <div className="md:col-span-2">
                <label htmlFor="cancelPolicy" className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                  İptal Politikası
                </label>
                <textarea
                  id="cancelPolicy"
                  name="cancelPolicy"
                  rows={3}
                  value={formData.cancelPolicy}
                  onChange={handleChange}
                  disabled={saving}
                  className="w-full px-4 py-3 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark disabled:opacity-50"
                  placeholder="İptal koşullarınızı belirtin (opsiyonel)"
                />
              </div>

              {/* Rezervasyon Notu */}
              <div className="md:col-span-2">
                <label htmlFor="reservationNote" className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                  Rezervasyon Notu
                </label>
                <textarea
                  id="reservationNote"
                  name="reservationNote"
                  rows={2}
                  value={formData.reservationNote}
                  onChange={handleChange}
                  disabled={saving}
                  className="w-full px-4 py-3 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark disabled:opacity-50"
                  placeholder="Rezervasyon ile ilgili özel notlar (opsiyonel)"
                />
              </div>

              {/* Video URL */}
              <div className="md:col-span-2">
                <label htmlFor="videoUrl" className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                  Video URL
                </label>
                <input
                  type="url"
                  id="videoUrl"
                  name="videoUrl"
                  value={formData.videoUrl}
                  onChange={handleChange}
                  disabled={saving}
                  className="w-full px-4 py-3 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark disabled:opacity-50"
                  placeholder="https://www.youtube.com/watch?v=... (opsiyonel)"
                />
              </div>

              {/* Mevcut Kapak Fotoğrafı */}
              {currentImages.coverPhoto && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                    Mevcut Kapak Fotoğrafı
                  </label>
                  <div className="w-full h-48 rounded-lg overflow-hidden border border-border-light dark:border-border-dark">
                    <img
                      src={getImageUrl(currentImages.coverPhoto)}
                      alt="Mevcut kapak fotoğrafı"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Yeni Kapak Fotoğrafı */}
              <div className="md:col-span-2">
                <label htmlFor="coverPhoto" className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                  {currentImages.coverPhoto ? 'Yeni Kapak Fotoğrafı' : 'Kapak Fotoğrafı'}
                </label>
                <input
                  type="file"
                  id="coverPhoto"
                  name="coverPhoto"
                  accept="image/*"
                  onChange={handleChange}
                  disabled={saving}
                  className="w-full px-4 py-3 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark disabled:opacity-50"
                />
                <p className="text-xs text-subtle-light dark:text-subtle-dark mt-1">
                  {currentImages.coverPhoto
                    ? 'Yeni fotoğraf seçmezseniz mevcut fotoğraf korunur'
                    : 'Kapak fotoğrafı seçin'
                  }
                </p>
              </div>

              {/* Resim Yönetimi */}
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-content-light dark:text-content-dark">
                    Resim Yönetimi
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowImageManager(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">photo_library</span>
                    Resimleri Yönet
                  </button>
                </div>

                {/* Resim Önizlemesi */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Kapak Fotoğrafı Önizleme */}
                  <div>
                    <h4 className="text-sm font-medium text-content-light dark:text-content-dark mb-2">
                      Mevcut Kapak Fotoğrafı
                    </h4>
                    <div className="w-full h-32 rounded-lg overflow-hidden border border-border-light dark:border-border-dark bg-gray-100 dark:bg-gray-800">
                      {currentImages.coverPhoto ? (
                        <img
                          src={getImageUrl(currentImages.coverPhoto)}
                          alt="Kapak fotoğrafı"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <span className="material-symbols-outlined text-2xl">image</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Galeri Resimleri Önizleme */}
                  <div>
                    <h4 className="text-sm font-medium text-content-light dark:text-content-dark mb-2">
                      Galeri Resimleri ({currentImages.galleryImages?.length || 0} adet)
                    </h4>
                    <div className="w-full h-32 rounded-lg border border-border-light dark:border-border-dark bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      {currentImages.galleryImages && currentImages.galleryImages.length > 0 ? (
                        <div className="grid grid-cols-4 h-full gap-1">
                          {currentImages.galleryImages.slice(0, 4).map((image, index) => (
                            <div key={image.id || index} className="relative">
                              <img
                                src={getImageUrl(image.imageUrl || image.imagePath || image.path || image)}
                                alt={`Galeri ${index + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src = 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
                                }}
                              />
                              {index === 3 && currentImages.galleryImages.length > 4 && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-medium">
                                  +{currentImages.galleryImages.length - 4}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <div className="text-center">
                            <span className="material-symbols-outlined text-xl">photo_library</span>
                            <p className="text-xs mt-1">Galeri boş</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Açık Alan */}
              <div className="md:col-span-2 flex items-center">
                <input
                  type="checkbox"
                  id="isOutdoor"
                  name="isOutdoor"
                  checked={formData.isOutdoor}
                  onChange={handleChange}
                  disabled={saving}
                  className="h-4 w-4 text-primary focus:ring-primary border-border-light dark:border-border-dark rounded disabled:opacity-50"
                />
                <label htmlFor="isOutdoor" className="ml-2 block text-sm text-content-light dark:text-content-dark">
                  Açık alan organizasyonu
                </label>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t border-border-light dark:border-border-dark">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-6 py-3 border border-border-light dark:border-border-dark text-content-light dark:text-content-dark font-medium rounded-lg hover:bg-background-light dark:hover:bg-background-dark transition-colors disabled:opacity-50"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Güncelleniyor...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">save</span>
                    Güncelle
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Resim Yönetimi Modal */}
      {showImageManager && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-background-light dark:bg-background-dark rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border-light dark:border-border-dark">
              <h2 className="text-xl font-bold text-content-light dark:text-content-dark">
                Resim Yönetimi - {formData.title}
              </h2>
              <button
                onClick={() => setShowImageManager(false)}
                className="p-2 hover:bg-background-light dark:hover:bg-background-dark rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-content-light dark:text-content-dark">
                  close
                </span>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <ImageManager
                organizationId={organizationId}
                currentImages={currentImages}
                onImagesUpdated={handleImagesUpdated}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EditOrganization