import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getApiUrl } from '../utils/api'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loginType, setLoginType] = useState('company') // 'company' veya 'admin'

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Hata mesajını temizle
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (loginType === 'admin') {
      // Admin girişi
      try {
        const response = await fetch(getApiUrl('/User/login'), {
          method: 'POST',
          headers: {
            'accept': 'text/plain',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        })

        if (response.ok) {
          let tokenData
          try {
            tokenData = await response.json()
          } catch {
            tokenData = await response.text()
          }
          
          let token = null
          if (typeof tokenData === 'string') {
            token = tokenData
          } else if (tokenData && tokenData.data && tokenData.data.token) {
            token = tokenData.data.token
          } else if (tokenData && tokenData.token) {
            token = tokenData.token
          }
          
          if (token && typeof token === 'string') {
            login(token, 'admin')
            navigate('/dashboard')
          } else {
            setError('Token alınamadı. Lütfen tekrar deneyin.')
          }
        } else {
          const errorText = await response.text()
          setError(errorText || 'Giriş başarısız. Email ve şifrenizi kontrol edin.')
        }
      } catch (error) {
        console.error('Admin giriş hatası:', error)
        setError('Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.')
      }
    } else {
      // Company girişi
      const result = await login(formData.email, formData.password)

      if (result.success) {
        // Email doğrulama kontrolü
        if (result.user && result.user.isEmailConfirmed === false) {
          setError('Email adresinizi doğrulamanız gerekiyor. Lütfen email kutunuzu kontrol edin ve doğrulama linkine tıklayın.')
          setLoading(false)
          return
        }
        
        // Başarılı giriş - dashboard'a yönlendir
        navigate('/dashboard')
      } else {
        setError(result.error)
      }
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark py-12 px-4 sm:px-6 lg:px-8">
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
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className={`material-symbols-outlined text-2xl ${loginType === 'admin' ? 'text-red-600' : 'text-primary'}`}>
              {loginType === 'admin' ? 'admin_panel_settings' : 'business'}
            </span>
            <h2 className="text-3xl font-bold text-content-light dark:text-content-dark">
              {loginType === 'admin' ? 'Admin Girişi' : 'Şirket Girişi'}
            </h2>
          </div>
          <p className="mt-2 text-sm text-subtle-light dark:text-subtle-dark">
            {loginType === 'admin' ? 'Yönetici paneline erişim için giriş yapın' : 'Şirket panelinize erişim için giriş yapın'}
          </p>
        </div>

        {/* Giriş Tipi Seçici */}
        <div className="bg-background-light dark:bg-background-dark rounded-xl shadow-lg border border-border-light dark:border-border-dark p-4">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              type="button"
              onClick={() => {
                setLoginType('company')
                setError('')
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                loginType === 'company'
                  ? 'bg-primary text-white'
                  : 'text-content-light dark:text-content-dark hover:bg-primary/10'
              }`}
            >
              <span className="material-symbols-outlined text-sm">business</span>
              Şirket
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginType('admin')
                setError('')
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                loginType === 'admin'
                  ? 'bg-red-600 text-white'
                  : 'text-content-light dark:text-content-dark hover:bg-red-600/10'
              }`}
            >
              <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
              Admin
            </button>
          </div>
        </div>

        <div className="bg-background-light dark:bg-background-dark rounded-xl shadow-2xl border border-border-light dark:border-border-dark p-8">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6">
              <div className="flex items-center">
                <span className="material-symbols-outlined mr-2">error</span>
                {error}
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                {loginType === 'admin' ? 'Admin Email' : 'E-posta Adresi'}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                className={`w-full px-4 py-3 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 ${
                  loginType === 'admin' ? 'focus:ring-red-500' : 'focus:ring-primary'
                } focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark`}
                placeholder={loginType === 'admin' ? 'admin@mutlugunum.com' : 'E-posta adresinizi girin'}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                Şifre
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                className={`w-full px-4 py-3 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 ${
                  loginType === 'admin' ? 'focus:ring-red-500' : 'focus:ring-primary'
                } focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark`}
                placeholder="Şifrenizi girin"
              />
            </div>
          </div>

          {loginType === 'company' && (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-border-light dark:border-border-dark rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-subtle-light dark:text-subtle-dark">
                  Beni hatırla
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-primary hover:text-primary/80">
                  Şifrenizi mi unuttunuz?
                </Link>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
                loginType === 'admin' 
                  ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
                  : 'bg-primary hover:bg-primary/90 focus:ring-primary'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Giriş yapılıyor...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">
                    {loginType === 'admin' ? 'admin_panel_settings' : 'login'}
                  </span>
                  <span>{loginType === 'admin' ? 'Admin Girişi' : 'Şirket Girişi'}</span>
                </>
              )}
            </button>
          </div>

          {loginType === 'company' && (
            <div className="text-center">
              <p className="text-sm text-subtle-light dark:text-subtle-dark">
                Hesabınız yok mu?{' '}
                <Link to="/company/register" className="text-primary hover:text-primary/80 font-medium">
                  Kayıt olun
                </Link>
              </p>
            </div>
          )}

          {loginType === 'admin' && (
            <div className="text-center">
              <p className="text-xs text-subtle-light dark:text-subtle-dark">
                Yetkisiz erişim yasaktır. Tüm aktiviteler kayıt altına alınmaktadır.
              </p>
            </div>
          )}
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login