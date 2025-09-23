import { useAuth } from '../contexts/AuthContext'
import { Navigate } from 'react-router-dom'

const AdminProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-subtle-light dark:text-subtle-dark">Yetki kontrol ediliyor...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />
  }

  return children
}

export default AdminProtectedRoute