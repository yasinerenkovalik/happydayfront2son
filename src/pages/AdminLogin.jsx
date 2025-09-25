import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getApiUrl } from '../utils/api'

const AdminLogin = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

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
        // Response'u JSON olarak parse et
        let tokenData
        try {
          tokenData = await response.json()
        } catch {
          // Eğer JSON değilse text olarak al
          tokenData = await response.text()
        }
        
        console.log('Admin login response:', tokenData)
        
        // Token'ı doğru şekilde çıkar
        let token = null
        
        if (typeof tokenData === 'string') {
          // Eğer string ise direkt kullan
          token = tokenData
        } else if (tokenData && tokenData.data && tokenData.data.token) {
          // Nested structure: {data: {token: "..."}}
          token = tokenData.data.token
        } else if (tokenData && tokenData.token) {
          // Direct structure: {token: "..."}
          token = tokenData.token
        }
        
        console.log('Extracted token:', token)
        
        if (token && typeof token === 'string') {
          // Admin olarak giriş yap
          login(token, 'admin')
          
          // Admin dashboard'a yönlendir
          navigate('/admin/dashboard')
        } else {
          setError('Token alınamadı. Lütfen tekrar deneyin.')
          console.error('Token extraction failed:', tokenData)
        }
      } else {
        const errorText = await response.text()
        setError(errorText || 'Giriş başarısız. Email ve şifrenizi kontrol edin.')
      }
    } catch (error) {
      console.error('Admin giriş hatası:', error)
      setError('Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500/10 via-background-light to-red-500/5 dark:from-red-500/5 dark:via-background-dark dark:to-red-500/10 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
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
            <span className="material-symbols-outlined text-red-600 text-2xl">admin_panel_settings</span>
            <h2 className="text-3xl font-extrabold text-content-light dark:text-content-dark">
              Admin Girişi
            </h2>
          </div>
          <p className="mt-2 text-sm text-subtle-light dark:text-subtle-dark">
            Yönetici paneline erişim için giriş yapın
          </p>
        </div>

        <div className="bg-background-light dark:bg-background-dark rounded-xl shadow-2xl border border-border-light dark:border-border-dark p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                Admin Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark placeholder-subtle-light dark:placeholder-subtle-dark focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                placeholder="admin@mutlugunum.com"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                Şifre
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-12 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark placeholder-subtle-light dark:placeholder-subtle-dark focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                  placeholder="Şifrenizi girin"
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
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Giriş yapılıyor...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">login</span>
                  <span>Admin Girişi</span>
                </>
              )}
            </button>

            <div className="text-center">
              <Link
                to="/login"
                className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
              >
                ← Şirket girişi için tıklayın
              </Link>
            </div>
          </form>
        </div>

        <div className="text-center">
          <p className="text-xs text-subtle-light dark:text-subtle-dark">
            Yetkisiz erişim yasaktır. Tüm aktiviteler kayıt altına alınmaktadır.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin