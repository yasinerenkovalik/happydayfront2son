import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { CONTACT_INFO } from '../../constants/contact'

const Header = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const handleLogout = () => {
    logout()
    setIsUserMenuOpen(false)
    navigate('/')
  }

  // Kullanıcı menüsünün dışına tıklandığında kapat
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <header className="border-b border-border-light dark:border-border-dark">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3">
              <img 
                src="/images/logos/logo-Photoroom.png" 
                alt="MutluGünüm Logo" 
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  // Fallback olarak SVG logo göster
                  e.target.style.display = 'none'
                  e.target.nextElementSibling.style.display = 'block'
                }}
              />
              <div className="w-8 h-8 text-primary hidden">
                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path d="M44 11.2727C44 14.0109 39.8386 16.3957 33.69 17.6364C39.8386 18.877 44 21.2618 44 24C44 26.7382 39.8386 29.123 33.69 30.3636C39.8386 31.6043 44 33.9891 44 36.7273C44 40.7439 35.0457 44 24 44C12.9543 44 4 40.7439 4 36.7273C4 33.9891 8.16144 31.6043 14.31 30.3636C8.16144 29.123 4 26.7382 4 24C4 21.2618 8.16144 18.877 14.31 17.6364C8.16144 16.3957 4 14.0109 4 11.2727C4 7.25611 12.9543 4 24 4C35.0457 4 44 7.25611 44 11.2727Z" fill="currentColor" />
                </svg>
              </div>
              <span className="text-xl font-bold text-content-light dark:text-content-dark">
                MutluGünüm
              </span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
         
           <Link 
              to="/" 
              className="text-sm font-medium text-subtle-light dark:text-subtle-dark hover:text-primary dark:hover:text-primary transition-colors"
            >
              Ana Sayfa
            </Link>
            <Link 
              to="/services" 
              className="text-sm font-medium text-subtle-light dark:text-subtle-dark hover:text-primary dark:hover:text-primary transition-colors"
            >
              Hizmetler
            </Link>
             
                      <Link 
              to="/contact" 
              className="text-sm font-medium text-subtle-light dark:text-subtle-dark hover:text-primary dark:hover:text-primary transition-colors"
            >
              İletişim
            </Link>
         
         
       
          </nav>
          
          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated() ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-content-light dark:text-content-dark hover:bg-background-light dark:hover:bg-background-dark rounded-full transition-colors"
                >
                  <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {user?.email?.charAt(0).toUpperCase()}
                  </div>
                  <span className="material-symbols-outlined text-sm">
                    {isUserMenuOpen ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
                
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg shadow-lg z-50">
                    <div className="py-2">
                      <div className="px-4 py-2 text-xs text-subtle-light dark:text-subtle-dark border-b border-border-light dark:border-border-dark">
                        {user?.email}
                      </div>
                      <Link
                        to="/dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="w-full text-left px-4 py-2 text-sm text-content-light dark:text-content-dark hover:bg-background-light dark:hover:bg-background-dark transition-colors block"
                      >
                        Şirket Paneli
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-content-light dark:text-content-dark hover:bg-background-light dark:hover:bg-background-dark transition-colors"
                      >
                        Çıkış Yap
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link 
                  to="/login"
                  className="px-4 py-2 text-sm font-bold text-white bg-primary rounded-full hover:bg-primary/90 transition-colors"
                >
                  Giriş Yap
                </Link>
                <Link 
                  to="/register"
                  className="px-4 py-2 text-sm font-bold text-primary bg-primary/20 dark:bg-primary/20 rounded-full hover:bg-primary/30 dark:hover:bg-primary/30 transition-colors"
                >
                  Kaydol
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-lg text-content-light dark:text-content-dark hover:bg-background-light dark:hover:bg-background-dark transition-colors"
          >
            <span className="material-symbols-outlined">
              {isMobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border-light dark:border-border-dark">
            <div className="py-4 space-y-4">
              {/* Mobile Navigation Links */}
              <nav className="flex flex-col space-y-3">
           
            <Link 
              to="/" 
              className="text-sm font-medium text-subtle-light dark:text-subtle-dark hover:text-primary dark:hover:text-primary transition-colors"
            >
              Ana Sayfa
            </Link>
            <Link 
              to="/services" 
              className="text-sm font-medium text-subtle-light dark:text-subtle-dark hover:text-primary dark:hover:text-primary transition-colors"
            >
              Hizmetler
            </Link>
             
                      <Link 
              to="/contact" 
              className="text-sm font-medium text-subtle-light dark:text-subtle-dark hover:text-primary dark:hover:text-primary transition-colors"
            >
              İletişim
            </Link>
         
         
              </nav>
              
              {/* Mobile Auth Section */}
              <div className="flex flex-col gap-3 pt-4 border-t border-border-light dark:border-border-dark">
                {isAuthenticated() ? (
                  <>
                    <div className="px-4 py-2 text-sm text-subtle-light dark:text-subtle-dark">
                      {user?.email}
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-4 py-2 text-sm font-bold text-white bg-primary rounded-full hover:bg-primary/90 transition-colors text-center"
                    >
                      Şirket Paneli
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsMobileMenuOpen(false)
                      }}
                      className="px-4 py-2 text-sm font-bold text-white bg-red-500 rounded-full hover:bg-red-600 transition-colors text-center"
                    >
                      Çıkış Yap
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/login"
                      className="px-4 py-2 text-sm font-bold text-white bg-primary rounded-full hover:bg-primary/90 transition-colors text-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Giriş Yap
                    </Link>
                    <Link 
                      to="/register"
                      className="px-4 py-2 text-sm font-bold text-primary bg-primary/20 dark:bg-primary/20 rounded-full hover:bg-primary/30 dark:hover:bg-primary/30 transition-colors text-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Kaydol
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header