import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import useCompany from '../../hooks/useCompany'
import { getImageUrl, getApiUrl } from '../../utils/api'
import { useCities, useDistricts } from '../../hooks/useFilterData'
import LocationPicker from '../LocationPicker/LocationPicker'

const CompanyProfile = () => {
  const { user, getAuthHeaders } = useAuth()
  const { company, loading: companyLoading, error: companyError, refetch } = useCompany()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // City ve District verileri
  const { cities } = useCities()

  const [profileData, setProfileData] = useState({
    companyName: '',
    email: '',
    phone: '',
    address: '',
    description: '',
    website: '',
    latitude: '',
    longitude: '',
    cityId: '',
    districtId: ''
  })

  const [coverPhoto, setCoverPhoto] = useState(null)
  const [coverPhotoPreview, setCoverPhotoPreview] = useState(null)

  // CityId'yi memoize et
  const selectedCityId = useMemo(() => profileData.cityId, [profileData.cityId])
  const { districts } = useDistricts(selectedCityId)

  // Company verisi geldiğinde form verilerini güncelle
  useEffect(() => {
    if (company) {
      setProfileData({
        companyName: company.name || '',
        email: company.email || user?.email || '',
        phone: company.phoneNumber || '',
        address: company.adress || '',
        description: company.description || '',
        website: company.website || '',
        latitude: company.latitude || '',
        longitude: company.longitude || '',
        cityId: company.cityId || '',
        districtId: company.districtId || ''
      })
    }
  }, [company, user?.email])

  // Company yükleme hatası varsa göster
  useEffect(() => {
    if (companyError) {
      setError(companyError)
    }
  }, [companyError])

  const handleChange = (e) => {
    const { name, value } = e.target

    setProfileData(prev => ({
      ...prev,
      [name]: value
    }))

    // Mesajları temizle
    if (error) setError('')
    if (success) setSuccess(false)
  }

  // Harita üzerinden konum değiştiğinde
  const handleLocationChange = (lat, lng) => {
    setProfileData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng
    }))

    // Mesajları temizle
    if (error) setError('')
    if (success) setSuccess(false)
  }

  // Kapak fotoğrafı seçildiğinde
  const handleCoverPhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setCoverPhoto(file)

      // Önizleme için URL oluştur
      const reader = new FileReader()
      reader.onload = (e) => {
        setCoverPhotoPreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)

    try {
      if (!user?.companyId) {
        throw new Error('Şirket ID bulunamadı')
      }

      // FormData oluştur (API multipart/form-data bekliyor)
      const formData = new FormData()
      formData.append('Id', user.companyId)
      formData.append('Name', profileData.companyName)
      formData.append('Adress', profileData.address)
      formData.append('PhoneNumber', profileData.phone)
      formData.append('Description', profileData.description)
      formData.append('Latitude', parseFloat(profileData.latitude) || 0)
      formData.append('Longitude', parseFloat(profileData.longitude) || 0)
      formData.append('CityId', parseInt(profileData.cityId) || 0)
      formData.append('DistrictId', parseInt(profileData.districtId) || 0)

      // Kapak fotoğrafı varsa ekle
      if (coverPhoto) {
        formData.append('CoverPhoto', coverPhoto)
      } else {
        formData.append('CoverPhoto', '')
      }

      const response = await fetch(getApiUrl('/Company/update'), {
        method: 'PUT',
        headers: {
          'Accept': '*/*',
          ...getAuthHeaders()
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error('Profil güncellenemedi')
      }

      const result = await response.json()
      if (result.isSuccess) {
        setSuccess(true)
        // Şirket verilerini yeniden yükle
        refetch()
      } else {
        throw new Error(result.message || 'Profil güncellenemedi')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (companyLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-subtle-light dark:text-subtle-dark">Profil yükleniyor...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-content-light dark:text-content-dark mb-6">
        Şirket Profili
      </h2>

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg mb-6">
          Profil başarıyla güncellendi!
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Kapak Fotoğrafı */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-content-light dark:text-content-dark mb-4">
          Kapak Fotoğrafı
        </h3>

        {/* Mevcut veya Önizleme Fotoğrafı */}
        <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border-light dark:border-border-dark mb-4">
          <img
            src={coverPhotoPreview || (company?.coverPhotoPath ? getImageUrl(company.coverPhotoPath) : 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')}
            alt="Şirket Kapak Fotoğrafı"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          <div className="absolute bottom-4 left-4 text-white">
            <h4 className="text-xl font-bold">{profileData.companyName || 'Şirket Adı'}</h4>
            <p className="text-sm opacity-90">{profileData.address || 'Adres'}</p>
          </div>
          {coverPhotoPreview && (
            <div className="absolute top-2 right-2">
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                Yeni Fotoğraf
              </span>
            </div>
          )}
        </div>

        {/* Fotoğraf Yükleme */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 cursor-pointer transition-colors">
            <span className="material-symbols-outlined text-sm">upload</span>
            <span className="text-sm font-medium">Fotoğraf Seç</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverPhotoChange}
              disabled={saving}
              className="hidden"
            />
          </label>

          {coverPhoto && (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              <span>{coverPhoto.name}</span>
              <button
                type="button"
                onClick={() => {
                  setCoverPhoto(null)
                  setCoverPhotoPreview(null)
                }}
                className="text-red-500 hover:text-red-700 ml-2"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          )}
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Desteklenen formatlar: JPG, PNG, GIF. Maksimum boyut: 5MB
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Şirket Adı */}
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
              Şirket Adı *
            </label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              required
              value={profileData.companyName}
              onChange={handleChange}
              disabled={saving}
              className="w-full px-4 py-3 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark disabled:opacity-50"
              placeholder="Şirket adınızı girin"
            />
          </div>

          {/* E-posta */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
              E-posta Adresi *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={profileData.email}
              onChange={handleChange}
              disabled={saving}
              className="w-full px-4 py-3 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark disabled:opacity-50"
              placeholder="E-posta adresinizi girin"
            />
          </div>

          {/* Telefon */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
              Telefon Numarası
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={profileData.phone}
              onChange={handleChange}
              disabled={saving}
              className="w-full px-4 py-3 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark disabled:opacity-50"
              placeholder="Telefon numaranızı girin"
            />
          </div>

          {/* Website */}
          <div>
            <label htmlFor="website" className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
              Website
            </label>
            <input
              type="url"
              id="website"
              name="website"
              value={profileData.website}
              onChange={handleChange}
              disabled={saving}
              className="w-full px-4 py-3 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark disabled:opacity-50"
              placeholder="https://www.example.com"
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
              value={profileData.cityId}
              onChange={handleChange}
              disabled={saving}
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
              value={profileData.districtId}
              onChange={handleChange}
              disabled={saving || !profileData.cityId}
              className="w-full px-4 py-3 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark disabled:opacity-50"
            >
              <option value="">İlçe Seçin</option>
              {districts.map((district) => (
                <option key={district.id} value={district.id}>
                  {district.districtName}
                </option>
              ))}
            </select>
            {!profileData.cityId && (
              <p className="text-xs text-subtle-light dark:text-subtle-dark mt-1">
                Önce şehir seçin
              </p>
            )}
          </div>

          {/* Adres */}
          <div className="md:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
              Adres
            </label>
            <textarea
              id="address"
              name="address"
              rows={3}
              value={profileData.address}
              onChange={handleChange}
              disabled={saving}
              className="w-full px-4 py-3 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark disabled:opacity-50"
              placeholder="Şirket adresinizi girin"
            />
          </div>

          {/* Açıklama */}
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
              Şirket Açıklaması
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={profileData.description}
              onChange={handleChange}
              disabled={saving}
              className="w-full px-4 py-3 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark disabled:opacity-50"
              placeholder="Şirketiniz hakkında bilgi verin"
            />
          </div>

          {/* Konum Bilgileri */}
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-border-light dark:border-border-dark">
              <LocationPicker
                latitude={profileData.latitude}
                longitude={profileData.longitude}
                onLocationChange={handleLocationChange}
                disabled={saving}
              />
            </div>
          </div>
        </div>

        {/* Şirket Bilgileri */}
        <div className="bg-background-light/50 dark:bg-background-dark/50 rounded-lg p-6 border border-border-light dark:border-border-dark">
          <h3 className="text-lg font-semibold text-content-light dark:text-content-dark mb-4">
            Şirket Detayları
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-border-light dark:border-border-dark">
              <span className="text-subtle-light dark:text-subtle-dark block text-xs uppercase tracking-wide">Şirket ID</span>
              <span className="font-mono text-content-light dark:text-content-dark text-sm">
                {user?.companyId}
              </span>
            </div>
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-border-light dark:border-border-dark">
              <span className="text-subtle-light dark:text-subtle-dark block text-xs uppercase tracking-wide">Kullanıcı Rolü</span>
              <span className="text-content-light dark:text-content-dark font-medium">
                {user?.role}
              </span>
            </div>
            {company && (
              <>
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-border-light dark:border-border-dark">
                  <span className="text-subtle-light dark:text-subtle-dark block text-xs uppercase tracking-wide">Şirket Adı</span>
                  <span className="text-content-light dark:text-content-dark font-medium">
                    {company.name || 'Belirtilmemiş'}
                  </span>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-border-light dark:border-border-dark">
                  <span className="text-subtle-light dark:text-subtle-dark block text-xs uppercase tracking-wide">E-posta</span>
                  <span className="text-content-light dark:text-content-dark font-medium">
                    {company.email || 'Belirtilmemiş'}
                  </span>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-border-light dark:border-border-dark">
                  <span className="text-subtle-light dark:text-subtle-dark block text-xs uppercase tracking-wide">Telefon</span>
                  <span className="text-content-light dark:text-content-dark font-medium">
                    {company.phoneNumber || 'Belirtilmemiş'}
                  </span>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-border-light dark:border-border-dark">
                  <span className="text-subtle-light dark:text-subtle-dark block text-xs uppercase tracking-wide">Adres</span>
                  <span className="text-content-light dark:text-content-dark font-medium">
                    {company.adress || 'Belirtilmemiş'}
                  </span>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-border-light dark:border-border-dark">
                  <span className="text-subtle-light dark:text-subtle-dark block text-xs uppercase tracking-wide">Şehir ID</span>
                  <span className="text-content-light dark:text-content-dark font-medium">
                    {company.cityId || 'Belirtilmemiş'}
                  </span>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-border-light dark:border-border-dark">
                  <span className="text-subtle-light dark:text-subtle-dark block text-xs uppercase tracking-wide">İlçe ID</span>
                  <span className="text-content-light dark:text-content-dark font-medium">
                    {company.districtId || 'Belirtilmemiş'}
                  </span>
                </div>
                {company.latitude && company.longitude && (
                  <>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-border-light dark:border-border-dark">
                      <span className="text-subtle-light dark:text-subtle-dark block text-xs uppercase tracking-wide">Enlem</span>
                      <span className="text-content-light dark:text-content-dark font-mono text-sm">
                        {company.latitude}
                      </span>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-border-light dark:border-border-dark">
                      <span className="text-subtle-light dark:text-subtle-dark block text-xs uppercase tracking-wide">Boylam</span>
                      <span className="text-content-light dark:text-content-dark font-mono text-sm">
                        {company.longitude}
                      </span>
                    </div>
                  </>
                )}
                {company.description && (
                  <div className="md:col-span-2 lg:col-span-3 bg-white dark:bg-gray-800 p-3 rounded-lg border border-border-light dark:border-border-dark">
                    <span className="text-subtle-light dark:text-subtle-dark block text-xs uppercase tracking-wide mb-2">Açıklama</span>
                    <span className="text-content-light dark:text-content-dark">
                      {company.description}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Kaydediliyor...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">save</span>
                Profili Güncelle
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CompanyProfile