import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getApiUrl } from '../utils/api'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    try {
      const response = await fetch(getApiUrl('/Company/request-password-reset'), {
        method: 'POST',
        headers: {
          'accept': 'text/plain',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email
        })
      })

      if (response.ok) {
        setMessage('Şifre sıfırlama linki email adresinize gönderildi. Lütfen email kutunuzu kontrol edin.')
        setEmail('')
      } else {
        const errorText = await response.text()
        setError(errorText || 'Bir hata oluştu. Lütfen tekrar deneyin.')
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
            Şifremi Unuttum
          </h2>
          <p className="mt-2 text-sm text-subtle-light dark:text-subtle-dark">
            Email adresinizi girin, size şifre sıfırlama linki gönderelim
          </p>
        </div>

        <div className="bg-background-light dark:bg-background-dark rounded-xl shadow-2xl border border-border-light dark:border-border-dark p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                Email Adresi
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark placeholder-subtle-light dark:placeholder-subtle-dark focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                placeholder="ornek@email.com"
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
              disabled={loading || !email}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Gönderiliyor...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">email</span>
                  <span>Sıfırlama Linki Gönder</span>
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

        <div className="text-center">
          <p className="text-xs text-subtle-light dark:text-subtle-dark">
            Hesabınız yok mu?{' '}
            <Link to="/register" className="text-primary hover:text-primary/80 font-medium">
              Kayıt olun
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword