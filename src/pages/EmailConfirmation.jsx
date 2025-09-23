import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

const EmailConfirmation = () => {
  const [searchParams] = useSearchParams()
  
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [confirmed, setConfirmed] = useState(false)

  // URL'den companyId ve token'ı al
  const companyId = searchParams.get('cid')
  const token = searchParams.get('token')

  useEffect(() => {
    const confirmEmail = async () => {
      if (!companyId || !token) {
        setError('Geçersiz doğrulama linki. Lütfen yeni bir doğrulama linki talep edin.')
        setLoading(false)
        return
      }

      console.log('Email confirmation parameters:')
      console.log('Company ID:', companyId)
      console.log('Token:', token)

      try {
        const response = await fetch(`${import.meta.env.PROD ? '/api' : 'http://193.111.77.142/api'}/Company/confirm-email`, {
          method: 'POST',
          headers: {
            'accept': '*/*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            companyId: companyId,
            token: token
          })
        })

        console.log('Confirmation response status:', response.status)

        if (response.ok) {
          // Response'u parse et
          let result
          try {
            result = await response.json()
          } catch {
            result = await response.text()
          }

          console.log('Confirmation response:', result)

          // API response'unda isSuccess field'ını kontrol et
          if (result && typeof result === 'object' && result.isSuccess === false) {
            setError(result.message || 'Email doğrulama başarısız. Lütfen tekrar deneyin.')
          } else {
            setMessage('Email adresiniz başarıyla doğrulandı! Artık hesabınızı kullanabilirsiniz.')
            setConfirmed(true)
          }
        } else {
          // HTTP error
          let errorText
          try {
            const errorResult = await response.json()
            errorText = errorResult.message || errorResult.errors || 'Email doğrulama başarısız.'
          } catch {
            errorText = await response.text()
          }
          setError(errorText || 'Email doğrulama başarısız. Lütfen tekrar deneyin.')
        }
      } catch (error) {
        console.error('Email confirmation error:', error)
        setError('Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.')
      } finally {
        setLoading(false)
      }
    }

    confirmEmail()
  }, [companyId, token])

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
            Email Doğrulama
          </h2>
          <p className="mt-2 text-sm text-subtle-light dark:text-subtle-dark">
            Email adresinizi doğruluyoruz...
          </p>
        </div>

        <div className="bg-background-light dark:bg-background-dark rounded-xl shadow-2xl border border-border-light dark:border-border-dark p-8">
          {loading && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-subtle-light dark:text-subtle-dark">
                Email adresiniz doğrulanıyor...
              </p>
            </div>
          )}

          {!loading && message && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-2xl">check_circle</span>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                <p className="text-green-800 dark:text-green-200 text-sm font-medium">{message}</p>
              </div>
              
              <div className="space-y-3">
                <Link
                  to="/login"
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">login</span>
                  <span>Giriş Yap</span>
                </Link>
                
                <Link
                  to="/"
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-border-light dark:border-border-dark rounded-lg shadow-sm text-sm font-medium text-content-light dark:text-content-dark bg-background-light dark:bg-background-dark hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">home</span>
                  <span>Ana Sayfa</span>
                </Link>
              </div>
            </div>
          )}

          {!loading && error && (
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-2xl">error</span>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <p className="text-red-800 dark:text-red-200 text-sm font-medium">{error}</p>
              </div>
              
              <div className="space-y-3">
                <Link
                  to="/login"
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">login</span>
                  <span>Giriş Sayfasına Git</span>
                </Link>
                
                <button
                  onClick={() => window.location.reload()}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-border-light dark:border-border-dark rounded-lg shadow-sm text-sm font-medium text-content-light dark:text-content-dark bg-background-light dark:bg-background-dark hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">refresh</span>
                  <span>Tekrar Dene</span>
                </button>
              </div>
            </div>
          )}

          {/* Debug bilgisi - production'da kaldırılacak */}
          {!loading && (companyId || token) && (
            <div className="mt-6 text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 p-3 rounded border-t">
              <p><strong>Debug Info:</strong></p>
              <p>Company ID: {companyId}</p>
              <p>Token: {token?.substring(0, 20)}...</p>
            </div>
          )}
        </div>

        <div className="text-center">
          <p className="text-xs text-subtle-light dark:text-subtle-dark">
            Sorun mu yaşıyorsunuz?{' '}
            <Link to="/contact" className="text-primary hover:text-primary/80 font-medium">
              İletişime geçin
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default EmailConfirmation