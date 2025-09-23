import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // URL'den token ve cid (companyId)'yi al
  const token = searchParams.get('token')
  const companyId = searchParams.get('cid')

  useEffect(() => {
    if (!token || !companyId) {
      setError('Geçersiz sıfırlama linki. Lütfen yeni bir sıfırlama linki talep edin.')
    }
  }, [token, companyId])

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const validatePassword = (password) => {
    if (password.length < 6) {
      return 'Şifre en az 6 karakter olmalıdır'
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Şifre en az bir küçük harf içermelidir'
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Şifre en az bir büyük harf içermelidir'
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Şifre en az bir rakam içermelidir'
    }
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    // Validasyon
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor')
      setLoading(false)
      return
    }

    const passwordError = validatePassword(formData.newPassword)
    if (passwordError) {
      setError(passwordError)
      setLoading(false)
      return
    }

    if (!token || !companyId) {
      setError('Geçersiz sıfırlama linki')
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`${import.meta.env.PROD ? '/api' : 'http://193.111.77.142/api'}/Company/reset-password`, {
        method: 'POST',
        headers: {
          'accept': 'text/plain',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          companyId: companyId,
          token: token,
          newPassword: formData.newPassword
        })
      })

      if (response.ok) {
        setMessage('Şifreniz başarıyla sıfırlandı! Giriş sayfasına yönlendiriliyorsunuz...')
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      } else {
        const errorText = await response.text()
        setError(errorText || 'Şifre sıfırlama başarısız. Lütfen tekrar deneyin.')
      }
    } catch (error) {
      console.error('Şifre sıfırlama hatası:', error)
      setError('Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background-light to-primary/5 dark:from-primary/5 dark:via-background-dark dark:to-primary/10 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
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
            Yeni Şifre Belirle
          </h2>
          <p className="mt-2 text-sm text-subtle-light dark:text-subtle-dark">
            Hesabınız için yeni bir şifre belirleyin
          </p>
          {/* Debug bilgisi - production'da kaldırılacak */}
          {(token && companyId) && (
            <div className="mt-2 text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 p-2 rounded">
              <p>Token: {token.substring(0, 10)}...</p>
              <p>Company ID: {companyId}</p>
            </div>
          )}
        </div>

        <div className="bg-background-light dark:bg-background-dark rounded-xl shadow-2xl border border-border-light dark:border-border-dark p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                Yeni Şifre
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pr-12 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark placeholder-subtle-light dark:placeholder-subtle-dark focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  placeholder="Yeni şifrenizi girin"
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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                Şifre Tekrar
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pr-12 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark placeholder-subtle-light dark:placeholder-subtle-dark focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  placeholder="Şifrenizi tekrar girin"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-subtle-light dark:text-subtle-dark hover:text-content-light dark:hover:text-content-dark"
                >
                  <span className="material-symbols-outlined text-sm">
                    {showConfirmPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Şifre Gereksinimleri */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                Şifre Gereksinimleri:
              </h4>
              <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <li className="flex items-center gap-2">
                  <span className={`material-symbols-outlined text-xs ${formData.newPassword.length >= 6 ? 'text-green-600' : 'text-gray-400'}`}>
                    {formData.newPassword.length >= 6 ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                  En az 6 karakter
                </li>
                <li className="flex items-center gap-2">
                  <span className={`material-symbols-outlined text-xs ${/(?=.*[a-z])/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                    {/(?=.*[a-z])/.test(formData.newPassword) ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                  En az bir küçük harf
                </li>
                <li className="flex items-center gap-2">
                  <span className={`material-symbols-outlined text-xs ${/(?=.*[A-Z])/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                    {/(?=.*[A-Z])/.test(formData.newPassword) ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                  En az bir büyük harf
                </li>
                <li className="flex items-center gap-2">
                  <span className={`material-symbols-outlined text-xs ${/(?=.*\d)/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                    {/(?=.*\d)/.test(formData.newPassword) ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                  En az bir rakam
                </li>
              </ul>
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
              disabled={loading || !formData.newPassword || !formData.confirmPassword || !token || !companyId}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Şifre Sıfırlanıyor...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">lock_reset</span>
                  <span>Şifreyi Sıfırla</span>
                </>
              )}
            </button>

            <div className="text-center">
              <Link
                to="/login"
                className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
              >
                ← Giriş sayfasına dön
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword