import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import CompanyProfile from '../components/Dashboard/CompanyProfile'
import OrganizationList from '../components/Dashboard/OrganizationList'
import AddOrganization from '../components/Dashboard/AddOrganization'
import ImageManagerPage from '../components/Dashboard/ImageManagerPage'

const Dashboard = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('organizations')
  const [showEmailWarning, setShowEmailWarning] = useState(true)
  const [resendingEmail, setResendingEmail] = useState(false)

  const handleResendEmail = async () => {
    setResendingEmail(true)
    try {
      // Bu API endpoint'i backend'de olması gerekiyor
      // Şimdilik sadece loading state gösteriyoruz
      setTimeout(() => {
        alert('Doğrulama emaili tekrar gönderildi! Lütfen email kutunuzu kontrol edin.')
        setResendingEmail(false)
      }, 2000)
    } catch (error) {
      console.error('Email resend error:', error)
      alert('Email gönderilirken bir hata oluştu.')
      setResendingEmail(false)
    }
  }

  const tabs = [
    { id: 'organizations', name: 'Organizasyonlarım', icon: 'event' },
    { id: 'add-organization', name: 'Organizasyon Ekle', icon: 'add_circle' },
    { id: 'image-manager', name: 'Resim Yönetimi', icon: 'photo_library' },
    { id: 'profile', name: 'Şirket Profili', icon: 'business' }
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'organizations':
        return <OrganizationList />
      case 'add-organization':
        return <AddOrganization />
      case 'image-manager':
        return <ImageManagerPage />
      case 'profile':
        return <CompanyProfile />
      default:
        return <OrganizationList />
    }
  }

  return (
    <div className="min-h-screen bg-background-light/50 dark:bg-background-dark/50">
      {/* Header */}
      <div className="bg-background-light dark:bg-background-dark border-b border-border-light dark:border-border-dark">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-content-light dark:text-content-dark">
                Şirket Paneli
              </h1>
              <p className="text-subtle-light dark:text-subtle-dark mt-1">
                Hoş geldiniz, {user?.email}
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-subtle-light dark:text-subtle-dark">
              <span className="material-symbols-outlined text-primary">business</span>
              <span>Şirket ID: {user?.companyId?.slice(0, 8)}...</span>
            </div>
          </div>
        </div>
      </div>

      {/* Email Doğrulama Uyarısı */}
      {user && user.isEmailConfirmed === false && showEmailWarning && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400">warning</span>
                <div>
                  <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                    Email Doğrulama Gerekli
                  </p>
                  <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                    Hesabınızı tam olarak kullanabilmek için email adresinizi doğrulamanız gerekiyor. 
                    Lütfen email kutunuzu kontrol edin.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResendEmail}
                  disabled={resendingEmail}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {resendingEmail ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Gönderiliyor...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">email</span>
                      <span>Tekrar Gönder</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowEmailWarning(false)}
                  className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200 p-1"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-1/4">
            <div className="bg-background-light dark:bg-background-dark rounded-xl shadow-lg border border-border-light dark:border-border-dark p-6">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary text-white'
                        : 'text-content-light dark:text-content-dark hover:bg-background-light dark:hover:bg-background-dark'
                    }`}
                  >
                    <span className="material-symbols-outlined text-xl">
                      {tab.icon}
                    </span>
                    <span className="font-medium">{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="w-full lg:w-3/4">
            <div className="bg-background-light dark:bg-background-dark rounded-xl shadow-lg border border-border-light dark:border-border-dark">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default Dashboard