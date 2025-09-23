import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background-light to-primary/5 dark:from-primary/5 dark:via-background-dark dark:to-primary/10 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
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
        </div>

        <div className="bg-background-light dark:bg-background-dark rounded-xl shadow-2xl border border-border-light dark:border-border-dark p-8">
          {/* 404 Icon */}
          <div className="w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-4xl">error_outline</span>
          </div>

          {/* 404 Text */}
          <h1 className="text-6xl font-black text-primary mb-4">404</h1>
          <h2 className="text-2xl font-bold text-content-light dark:text-content-dark mb-4">
            Sayfa Bulunamadı
          </h2>
          <p className="text-subtle-light dark:text-subtle-dark mb-8 leading-relaxed">
            Aradığınız sayfa mevcut değil veya taşınmış olabilir. 
            Lütfen URL'yi kontrol edin veya ana sayfaya dönün.
          </p>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Link
              to="/"
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            >
              <span className="material-symbols-outlined text-sm">home</span>
              <span>Ana Sayfaya Dön</span>
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-border-light dark:border-border-dark rounded-lg shadow-sm text-sm font-medium text-content-light dark:text-content-dark bg-background-light dark:bg-background-dark hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>Geri Git</span>
            </button>
          </div>

          {/* Help Links */}
          <div className="mt-8 pt-6 border-t border-border-light dark:border-border-dark">
            <p className="text-sm text-subtle-light dark:text-subtle-dark mb-4">
              Yardıma mı ihtiyacınız var?
            </p>
            <div className="flex justify-center space-x-6">
              <Link
                to="/services"
                className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Hizmetler
              </Link>
              <Link
                to="/contact"
                className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
              >
                İletişim
              </Link>
              <Link
                to="/help"
                className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Yardım
              </Link>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-xs text-subtle-light dark:text-subtle-dark">
            Hata kodu: 404 - Sayfa bulunamadı
          </p>
          <p className="text-xs text-subtle-light dark:text-subtle-dark mt-1">
            Sorun devam ederse lütfen{' '}
            <Link to="/contact" className="text-primary hover:text-primary/80 font-medium">
              bizimle iletişime geçin
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default NotFound