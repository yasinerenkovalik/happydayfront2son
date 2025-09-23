import { Link } from 'react-router-dom'
import { CONTACT_INFO } from '../../constants/contact'

const Footer = () => {
  return (
    <footer className="bg-background-light dark:bg-background-dark border-t border-border-light dark:border-border-dark">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3">
            <img 
              src="/images/logos/logo-Photoroom.png" 
              alt="MutluGünüm Logo" 
              className="w-12 h-12 object-contain"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
            <span className="text-2xl font-bold text-content-light dark:text-content-dark">
              MutluGünüm
            </span>
          </Link>
          <p className="mt-2 text-sm text-subtle-light dark:text-subtle-dark max-w-md mx-auto">
            Hayallerinizdeki organizasyonu gerçekleştirin. Profesyonel hizmetlerimizle unutulmaz anlar yaratın.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* İletişim Bilgileri */}
          <div>
            <h3 className="text-lg font-semibold text-content-light dark:text-content-dark mb-4">
              İletişim
            </h3>
            <div className="space-y-2">
              <p className="text-sm text-subtle-light dark:text-subtle-dark">
                <a href={`tel:${CONTACT_INFO.phone}`} className="hover:text-primary transition-colors">
                  {CONTACT_INFO.phone}
                </a>
              </p>
              <p className="text-sm text-subtle-light dark:text-subtle-dark">
                <a href={`mailto:${CONTACT_INFO.email}`} className="hover:text-primary transition-colors">
                  {CONTACT_INFO.email}
                </a>
              </p>
              <p className="text-sm text-subtle-light dark:text-subtle-dark">
                {CONTACT_INFO.address}
              </p>
              <p className="text-sm text-subtle-light dark:text-subtle-dark">
                {CONTACT_INFO.workingHours}
              </p>
            </div>
          </div>

          {/* Hızlı Linkler */}
          <div>
            <h3 className="text-lg font-semibold text-content-light dark:text-content-dark mb-4">
              Hızlı Linkler
            </h3>
            <nav className="flex flex-col space-y-2">
              <Link 
                to="/about" 
                className="text-sm text-subtle-light dark:text-subtle-dark hover:text-primary transition-colors"
              >
                Hakkımızda
              </Link>
              <Link 
                to="/contact" 
                className="text-sm text-subtle-light dark:text-subtle-dark hover:text-primary transition-colors"
              >
                İletişim
              </Link>
              <a 
                href="#" 
                className="text-sm text-subtle-light dark:text-subtle-dark hover:text-primary transition-colors"
              >
                Gizlilik Politikası
              </a>
              <a 
                href="#" 
                className="text-sm text-subtle-light dark:text-subtle-dark hover:text-primary transition-colors"
              >
                Kullanım Koşulları
              </a>
            </nav>
          </div>

          {/* Sosyal Medya */}
          <div>
            <h3 className="text-lg font-semibold text-content-light dark:text-content-dark mb-4">
              Bizi Takip Edin
            </h3>
            <div className="flex space-x-4">
              <a 
                href={CONTACT_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-subtle-light dark:text-subtle-dark hover:text-primary transition-colors"
                title={`Instagram: ${CONTACT_INFO.instagram}`}
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.749.097.118.112.221.083.402-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
                </svg>
              </a>
              <a href="#" className="text-subtle-light dark:text-subtle-dark hover:text-primary transition-colors">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path clipRule="evenodd" d="M12.315 2c-4.04.1-7.234 3.313-7.31 7.353-.072 3.896 2.45 7.155 6 7.55v-5.417H9.25V9.5h1.755V7.95c0-1.742 1.043-2.7 2.625-2.7.75 0 1.5.14 1.5.14v1.82h-1.01c-.85 0-1.12.53-1.12 1.07v1.29h2.12l-.337 1.983h-1.783v5.417c3.55-.395 6.072-3.654 6-7.55C20,5.25 16.5,2 12.315 2z" fillRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-subtle-light dark:text-subtle-dark hover:text-primary transition-colors">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.71v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
            <p className="text-sm text-subtle-light dark:text-subtle-dark mt-3">
              Instagram: {CONTACT_INFO.instagram}
            </p>
          </div>
        </div>
        
        <div className="mt-8 border-t border-border-light dark:border-border-dark pt-8 text-center">
          <p className="text-sm text-subtle-light dark:text-subtle-dark">
            © 2023 MutluGünüm. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer