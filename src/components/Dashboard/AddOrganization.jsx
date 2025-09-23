import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useCities, useDistricts, useCategories } from '../../hooks/useFilterData'
import { getApiUrl } from '../../utils/api'

const AddOrganization = () => {
  const { user, getAuthHeaders } = useAuth()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    maxGuestCount: '',
    duration: '',
    cityId: '',
    districtId: '',
    categoryId: '',
    isOutdoor: false,
    coverPhoto: null,
    images: [],
    services: '',
    cancelPolicy: '',
    reservationNote: '',
    videoUrl: ''
  })

  // API'den verileri çek
  const { cities } = useCities()
  const { districts } = useDistricts(formData.cityId)
  const { categories } = useCategories()

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: type === 'checkbox' ? checked : 
                type === 'file' ? (name === 'images' ? Array.from(files) : files[0]) : 
                value
      }
      
      // Şehir değiştiğinde ilçeyi sıfırla
      if (name === 'cityId') {
        newData.districtId = ''
      }
      
      return newData
    })
    
    // Hata mesajını temizle
    if (error) setError('')
    if (success) setSuccess(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      // FormData oluştur (dosya yükleme için)
      const submitData = new FormData()
      
      // Zorunlu alanlar
      submitData.append('Title', formData.title)
      submitData.append('Description', formData.description)
      submitData.append('Price', parseFloat(formData.price))
      submitData.append('MaxGuestCount', parseInt(formData.maxGuestCount))
      submitData.append('Duration', formData.duration)
      submitData.append('CityId', parseInt(formData.cityId))
      submitData.append('DistrictId', parseInt(formData.districtId))
      submitData.append('CategoryId', parseInt(formData.categoryId))
      submitData.append('IsOutdoor', formData.isOutdoor)
      submitData.append('CompanyId', user?.companyId)
      
      // Opsiyonel alanlar
      submitData.append('Services', formData.services || '')
      submitData.append('CancelPolicy', formData.cancelPolicy || '')
      submitData.append('ReservationNote', formData.reservationNote || '')
      submitData.append('VideoUrl', formData.videoUrl || '')
      
      // Dosyalar
      if (formData.coverPhoto) {
        submitData.append('CoverPhoto', formData.coverPhoto)
      }
      
      // Çoklu resimler
      if (formData.images && formData.images.length > 0) {
        formData.images.forEach((image, index) => {
          submitData.append('Images', image)
        })
      }

      const response = await fetch(getApiUrl('/Organization/AddOrganization'), {
        method: 'POST',
        headers: {
          'Accept': 'text/plain',
          ...getAuthHeaders()
        },
        body: submitData
      })

      if (!response.ok) {
        throw new Error('Organizasyon oluşturulamadı')
      }

      const result = await response.json()
      if (result.isSuccess) {
        setSuccess(true)
        // Formu sıfırla
        setFormData({
          title: '',
          description: '',
          price: '',
          maxGuestCount: '',
          duration: '',
          cityId: '',
          districtId: '',
          categoryId: '',
          isOutdoor: false,
          coverPhoto: null,
          images: [],
          services: '',
          cancelPolicy: '',
          reservationNote: '',
          videoUrl: ''
        })
        // File input'ları sıfırla
        const fileInputs = document.querySelectorAll('input[type="file"]')
        fileInputs.forEach(input => input.value = '')
      } else {
        throw new Error(result.message || 'Organizasyon oluşturulamadı')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-content-light dark:text-content-dark mb-6">
        Yeni Organizasyon Ekle
      </h2>

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg mb-6">
          Organizasyon başarıyla oluşturuldu!
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
              disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
              className="w-full px-4 py-3 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark disabled:opacity-50"
              placeholder="Örn: 4 saat, Tüm gün"
            />
          </div>

          {/* Şehir */}
          <div>
            <label htmlFor="cityId" className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
              Şehir *
            </label>
            <select
              id="cityId"
              name="cityId"
              required
              value={formData.cityId}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-4 py-3 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark disabled:opacity-50"
            >
              <option value="">Şehir Seçin</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.cityName}
                </option>
              ))}
            </select>
          </div>

          {/* İlçe */}
          <div>
            <label htmlFor="districtId" className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
              İlçe *
            </label>
            <select
              id="districtId"
              name="districtId"
              required
              value={formData.districtId}
              onChange={handleChange}
              disabled={loading || !formData.cityId}
              className="w-full px-4 py-3 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark disabled:opacity-50"
            >
              <option value="">İlçe Seçin</option>
              {districts.map((district) => (
                <option key={district.id} value={district.id}>
                  {district.districtName || district.name}
                </option>
              ))}
            </select>
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
              disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
              className="w-full px-4 py-3 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark disabled:opacity-50"
              placeholder="https://www.youtube.com/watch?v=... (opsiyonel)"
            />
          </div>

          {/* Kapak Fotoğrafı */}
          <div>
            <label htmlFor="coverPhoto" className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
              Kapak Fotoğrafı
            </label>
            <input
              type="file"
              id="coverPhoto"
              name="coverPhoto"
              accept="image/*"
              onChange={handleChange}
              disabled={loading}
              className="w-full px-4 py-3 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark disabled:opacity-50"
            />
          </div>

          {/* Galeri Resimleri */}
          <div>
            <label htmlFor="images" className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
              Galeri Resimleri
            </label>
            <input
              type="file"
              id="images"
              name="images"
              accept="image/*"
              multiple
              onChange={handleChange}
              disabled={loading}
              className="w-full px-4 py-3 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark disabled:opacity-50"
            />
            <p className="text-xs text-subtle-light dark:text-subtle-dark mt-1">
              Birden fazla resim seçebilirsiniz
            </p>
          </div>

          {/* Açık Alan */}
          <div className="md:col-span-2 flex items-center">
            <input
              type="checkbox"
              id="isOutdoor"
              name="isOutdoor"
              checked={formData.isOutdoor}
              onChange={handleChange}
              disabled={loading}
              className="h-4 w-4 text-primary focus:ring-primary border-border-light dark:border-border-dark rounded disabled:opacity-50"
            />
            <label htmlFor="isOutdoor" className="ml-2 block text-sm text-content-light dark:text-content-dark">
              Açık alan organizasyonu
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Oluşturuluyor...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">add</span>
                Organizasyon Oluştur
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddOrganization