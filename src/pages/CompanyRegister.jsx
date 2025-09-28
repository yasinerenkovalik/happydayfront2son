import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { getApiUrl } from '../utils/api'
import { useCities, useDistricts } from '../hooks/useFilterData'

const CompanyRegister = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { cities, loading: citiesLoading } = useCities()
  const [selectedCityId, setSelectedCityId] = useState('')
  const { districts, loading: districtsLoading } = useDistricts(selectedCityId)

  const [formData, setFormData] = useState({
    token: '',
    email: '',
    password: '',
    companyName: '',
    adress: '',
    phoneNumber: '',
    description: '',
    cityId: '',
    districtId: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // URL'den token ve email'i al
  useEffect(() => {
    const rawToken = searchParams.get('token')
    const email = searchParams.get('email')

    console.log('URL Parameters:')
    console.log('Raw token from URL:', rawToken)
    console.log('Email from URL:', email)

    if (rawToken) {
      // Token'ı parse et
      let actualToken = rawToken
      try {
        // Eğer JSON string ise parse et
        const parsed = JSON.parse(rawToken)
        actualToken = parsed.token || rawToken
      } catch {
        // JSON değilse direkt kullan
        actualToken = rawToken
      }

      console.log('Parsed token:', actualToken)

      setFormData(prev => ({
        ...prev,
        token: actualToken,
        email: email || ''
      }))
    } else {
      setError('Geçersiz davet linki. Lütfen yeni bir davet linki talep edin.')
    }
  }, [searchParams])

  // Update cityId and districtId when selections change
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      cityId: selectedCityId
    }))
  }, [selectedCityId])

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      districtId: prev.districtId
    }))
  }, [districts])

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleCityChange = (e) => {
    const cityId = e.target.value
    setSelectedCityId(cityId)
    // Reset district when city changes
    setFormData(prev => ({
      ...prev,
      cityId: cityId,
      districtId: ''
    }))
  }

  const handleDistrictChange = (e) => {
    setFormData(prev => ({
      ...prev,
      districtId: e.target.value
    }))
  }

  const validateForm = () => {
    if (!formData.token) {
      setError('Davet tokenı bulunamadı.')
      return false
    }
    if (!formData.email) {
      setError('Email adresi gereklidir.')
      return false
    }
    if (!formData.password || formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.')
      return false
    }
    if (!formData.companyName) {
      setError('Şirket adı gereklidir.')
      return false
    }
    if (!formData.phoneNumber) {
      setError('Telefon numarası gereklidir.')
      return false
    }
    if (!formData.cityId) {
      setError('Şehir seçimi gereklidir.')
      return false
    }
    if (!formData.districtId) {
      setError('İlçe seçimi gereklidir.')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    if (!validateForm()) {
      setLoading(false)
      return
    }

    try {
      const requestData = {
        token: formData.token,
        email: formData.email,
        password: formData.password,
        companyName: formData.companyName,
        adress: formData.adress,
        phoneNumber: formData.phoneNumber,
        description: formData.description,
        cityId: parseInt(formData.cityId, 10),
        districtId: parseInt(formData.districtId, 10)
      }

      console.log('Sending registration request:', requestData)
      console.log('Token length:', formData.token?.length)

      const response = await fetch(getApiUrl('/company/register-by-invite'), {
        method: 'POST',
        headers: {
          'accept': 'text/plain',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })

      if (response.ok) {
        // Response'u JSON olarak parse et
        let result
        try {
          result = await response.json()
        } catch {
          // Eğer JSON değilse text olarak al
          result = await response.text()
        }

        console.log('Register response:', result)

        // API response'unda isSuccess field'ını kontrol et
        if (result && typeof result === 'object' && result.isSuccess === false) {
          // API başarısız response döndü
          setError(result.message || 'Kayıt işlemi başarısız. Lütfen tekrar deneyin.')
        } else if (result && typeof result === 'object' && result.isSuccess === true) {
          // Başarılı kayıt
          setMessage('Şirket kaydınız başarıyla tamamlandı! Giriş sayfasına yönlendiriliyorsunuz...')
          setTimeout(() => {
            navigate('/login')
          }, 3000)
        } else {
          // Eski format veya farklı response
          setMessage('Şirket kaydınız başarıyla tamamlandı! Giriş sayfasına yönlendiriliyorsunuz...')
          setTimeout(() => {
            navigate('/login')
          }, 3000)
        }
      } else {
        // HTTP error (4xx, 5xx)
        let errorText
        try {
          const errorResult = await response.json()
          errorText = errorResult.message || errorResult.errors || 'Kayıt işlemi başarısız.'
        } catch {
          errorText = await response.text()
        }
        setError(errorText || 'Kayıt işlemi başarısız. Lütfen tekrar deneyin.')
      }
    } catch (error) {
      console.error('Kayıt hatası:', error)
      setError('Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background-light to-primary/5 dark:from-primary/5 dark:via-background-dark dark:to-primary/10 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <img
              className="mx-auto h-16 w-auto"
              src="/images/logos/logo-Photoroom.png"
              alt="MutluGünüm"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-content-light dark:text-content-dark">
            Şirket Kaydı
          </h2>
          <p className="mt-2 text-sm text-subtle-light dark:text-subtle-dark">
            Davet linki ile şirket hesabınızı oluşturun
          </p>
        </div>

        <div className="bg-background-light dark:bg-background-dark rounded-xl shadow-2xl border border-border-light dark:border-border-dark p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Token (Hidden) */}
            <input type="hidden" name="token" value={formData.token} />

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                Email Adresi
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="ornek@sirket.com"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                Şifre
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pr-12 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="En az 6 karakter"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-subtle-light dark:text-subtle-dark hover:text-content-light dark:hover:text-content-dark"
                >
                  <span className="material-symbols-outlined text-sm">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Company Name */}
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                Şirket Adı
              </label>
              <input
                id="companyName"
                name="companyName"
                type="text"
                required
                value={formData.companyName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Örnek Organizasyon Ltd."
                disabled={loading}
              />
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                Telefon Numarası
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                required
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="+90 555 123 45 67"
                disabled={loading}
              />
            </div>

            {/* Address */}
            <div>
              <label htmlFor="adress" className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                Adres (Opsiyonel)
              </label>
              <textarea
                id="adress"
                name="adress"
                rows="3"
                value={formData.adress}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Şirket adresi"
                disabled={loading}
              />
            </div>

            {/* City Selection */}
            <div>
              <label htmlFor="citySelect" className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                Şehir
              </label>
              <select
                id="citySelect"
                value={selectedCityId}
                onChange={handleCityChange}
                className="w-full px-4 py-3 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={loading || citiesLoading}
              >
                <option value="">Şehir Seçin</option>
                {citiesLoading ? (
                  <option value="">Yükleniyor...</option>
                ) : (
                  cities.map(city => (
                    <option key={city.id} value={city.id}>
                      {city.cityName}
                    </option>
                  ))
                )}
              </select>
              {citiesLoading && (
                <p className="mt-1 text-sm text-subtle-light dark:text-subtle-dark">Şehirler yükleniyor...</p>
              )}
            </div>

            {/* District Selection */}
            <div>
              <label htmlFor="districtSelect" className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                İlçe
              </label>
              <select
                id="districtSelect"
                value={formData.districtId}
                onChange={handleDistrictChange}
                className="w-full px-4 py-3 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={loading || districtsLoading || !selectedCityId}
              >
                <option value="">İlçe Seçin</option>
                {districtsLoading ? (
                  <option value="">Yükleniyor...</option>
                ) : (
                  districts.map(district => (
                    <option key={district.id} value={district.id}>
                      {district.districtName}
                    </option>
                  ))
                )}
              </select>
              {!selectedCityId && (
                <p className="mt-1 text-sm text-subtle-light dark:text-subtle-dark">İlçe seçmek için önce bir şehir seçin</p>
              )}
              {districtsLoading && selectedCityId && (
                <p className="mt-1 text-sm text-subtle-light dark:text-subtle-dark">İlçeler yükleniyor...</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                Açıklama (Opsiyonel)
              </label>
              <textarea
                id="description"
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Şirket hakkında kısa açıklama"
                disabled={loading}
              />
            </div>

            {message && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center">
                  <span className="material-symbols-outlined text-green-600 dark:text-green-400 mr-2">check_circle</span>
                  <p className="text-green-800 dark:text-green-200 text-sm">{message}</p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center">
                  <span className="material-symbols-outlined text-red-600 dark:text-red-400 mr-2">error</span>
                  <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !formData.token}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Kayıt Yapılıyor...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">business</span>
                  <span>Şirket Kaydını Tamamla</span>
                </>
              )}
            </button>

            <div className="text-center">
              <Link
                to="/login"
                className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Zaten hesabınız var mı? Giriş yapın
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CompanyRegister