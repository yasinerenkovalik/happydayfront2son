import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useCategories } from '../../hooks/useFilterData'
import { getApiUrl } from '../../utils/api'

const AdminAddOrganization = () => {
  const { user, getAuthHeaders } = useAuth()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [companies, setCompanies] = useState([])
  const [companiesLoading, setCompaniesLoading] = useState(true)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    maxGuestCount: '',
    duration: '',
    categoryId: '',
    companyId: '', // Admin seçecek
    isOutdoor: false,
    coverPhoto: null,
    images: [],
    services: [],
    cancelPolicy: '',
    reservationNote: '',
    videoUrl: ''
  })

  const [newService, setNewService] = useState('')

  // API'den verileri çek
  const { categories } = useCategories()

  // Şirketleri çek
  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      setCompaniesLoading(true)
      
      const response = await fetch(getApiUrl('/Company/CompanyGetAll'), {
        method: 'GET',
        headers: {
          'Accept': 'text/plain',
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        }
      })

      if (!response.ok) {
        throw new Error('Şirketler yüklenemedi')
      }

      const result = await response.json()
      if (result.isSuccess) {
        setCompanies(result.data || [])
      } else {
        throw new Error(result.message || 'Şirketler yüklenemedi')
      }
    } catch (err) {
      console.error('Şirketler yüklenirken hata:', err)
      setError('Şirketler yüklenemedi: ' + err.message)
    } finally {
      setCompaniesLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              type === 'file' ? (name === 'images' ? Array.from(files) : files[0]) : 
              value
    }))
    
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
      if (!formData.companyId) {
        throw new Error('Lütfen bir şirket seçin')
      }

      // FormData oluştur (dosya yükleme için)
      const submitData = new FormData()
      
      // Zorunlu alanlar
      submitData.append('Title', formData.title)
      submitData.append('Description', formData.description)
      submitData.append('Price', parseFloat(formData.price))
      submitData.append('MaxGuestCount', parseInt(formData.maxGuestCount))
      submitData.append('Duration', formData.duration)
      submitData.append('CategoryId', parseInt(formData.categoryId))
      submitData.append('IsOutdoor', formData.isOutdoor)
      submitData.append('CompanyId', formData.companyId) // Admin seçtiği şirket
      
      // Opsiyonel alanlar
      // Hizmetleri JSON string olarak gönder
      if (formData.services && formData.services.length > 0) {
        submitData.append('Services', JSON.stringify(formData.services))
      } else {
        submitData.append('Services', '')
      }
      submitData.append('CancelPolicy', formData.cancelPolicy || '')
      submitData.append('ReservationNote', formData.reservationNote || '')
      submitData.append('VideoUrl', formData.videoUrl || '')
      
      // Dosyalar
      if (formData.coverPhoto) {
        submitData.append('CoverPhoto', formData.coverPhoto)
      }
      
      // Çoklu resimler
      if (formData.images && formData.images.length > 0) {
        formData.images.forEach((image) => {
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
          categoryId: '',
          companyId: '',
          isOutdoor: false,
          coverPhoto: null,
          images: [],
          services: [],
          cancelPolicy: '',
          reservationNote: '',
          videoUrl: ''
        })
        setNewService('')
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

  const selectedCompany = companies.find(c => c.id === formData.companyId)

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="material-symbols-outlined text-red-600 text-2xl">add_business</span>
        <h2 className="text-2xl font-bold text-content-light dark:text-content-dark">
          Organizasyon Ekle (Admin)
        </h2>
      </div>

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg mb-6">
          <div className="flex items-center">
            <span className="material-symbols-outlined mr-2">check_circle</span>
            Organizasyon başarıyla oluşturuldu!
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6">
          <div className="flex items-center">
            <span className="material-symbols-outlined mr-2">error</span>
            {error}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Şirket Seçimi */}
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-red-600">business</span>
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
              Şirket Seçimi
            </h3>
          </div>
          
          {companiesLoading ? (
            <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
              <span>Şirketler yükleniyor...</span>
            </div>
          ) : (
            <>
              <select
                name="companyId"
                required
                value={formData.companyId}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-4 py-3 border border-red-300 dark:border-red-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-800 text-content-light dark:text-content-dark disabled:opacity-50"
              >
                <option value="">Şirket Seçin</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name} - {company.email}
                  </option>
                ))}
              </select>
              
              {selectedCompany && (
                <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-700">
                  <div className="text-sm">
                    <p className="font-medium text-red-800 dark:text-red-200">Seçili Şirket:</p>
                    <p className="text-red-700 dark:text-red-300">
                      <strong>{selectedCompany.name}</strong>
                    </p>
                    <p className="text-red-600 dark:text-red-400">
                      {selectedCompany.email} • {selectedCompany.phoneNumber || 'Telefon yok'}
                    </p>
                    {selectedCompany.adress && (
                      <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                        📍 {selectedCompany.adress}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

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
              className="w-full px-4 py-3 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark disabled:opacity-50"
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
              className="w-full px-4 py-3 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark disabled:opacity-50"
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
              className="w-full px-4 py-3 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark disabled:opacity-50"
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
              className="w-full px-4 py-3 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark disabled:opacity-50"
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
              className="w-full px-4 py-3 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark disabled:opacity-50"
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
              disabled={loading}
              className="w-full px-4 py-3 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark disabled:opacity-50"
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
            <label className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
              Hizmetler
            </label>
            
            {/* Hizmet Ekleme */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    if (newService.trim() && !formData.services.includes(newService.trim())) {
                      setFormData(prev => ({
                        ...prev,
                        services: [...prev.services, newService.trim()]
                      }))
                      setNewService('')
                    }
                  }
                }}
                disabled={loading}
                className="flex-1 px-3 py-2 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark disabled:opacity-50"
                placeholder="Hizmet adı girin ve Enter'a basın"
              />
              <button
                type="button"
                onClick={() => {
                  if (newService.trim() && !formData.services.includes(newService.trim())) {
                    setFormData(prev => ({
                      ...prev,
                      services: [...prev.services, newService.trim()]
                    }))
                    setNewService('')
                  }
                }}
                disabled={loading || !newService.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="material-symbols-outlined text-sm">add</span>
              </button>
            </div>

            {/* Hizmet Listesi */}
            {formData.services.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-subtle-light dark:text-subtle-dark">
                  Eklenen hizmetler ({formData.services.length} adet):
                </p>
                <div className="flex flex-wrap gap-2">
                  {formData.services.map((service, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 px-3 py-1 rounded-full text-sm"
                    >
                      <span>{service}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            services: prev.services.filter((_, i) => i !== index)
                          }))
                        }}
                        disabled={loading}
                        className="hover:bg-red-200 dark:hover:bg-red-800/30 rounded-full p-1 transition-colors disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-xs">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <p className="text-xs text-subtle-light dark:text-subtle-dark mt-2">
              Sunduğunuz hizmetleri tek tek ekleyin. Her hizmeti yazdıktan sonra Enter'a basın veya + butonuna tıklayın.
            </p>
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
              className="w-full px-4 py-3 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark disabled:opacity-50"
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
              className="w-full px-4 py-3 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark disabled:opacity-50"
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
              className="w-full px-4 py-3 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark disabled:opacity-50"
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
              className="w-full px-4 py-3 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark disabled:opacity-50"
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
              className="w-full px-4 py-3 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark disabled:opacity-50"
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
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-border-light dark:border-border-dark rounded disabled:opacity-50"
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
            disabled={loading || !formData.companyId}
            className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Oluşturuluyor...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">add_business</span>
                Organizasyon Oluştur
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdminAddOrganization