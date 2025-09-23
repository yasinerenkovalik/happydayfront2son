import { createContext, useContext, useState, useEffect } from 'react'
import { getApiUrl } from '../utils/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Sayfa yüklendiğinde localStorage'dan token'ı kontrol et
  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
    
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const response = await fetch(getApiUrl('/Company/login'), {
        method: 'POST',
        headers: {
          'Accept': 'text/plain',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password
        })
      })

      if (!response.ok) {
        throw new Error('Giriş başarısız')
      }

      const result = await response.json()
      
      if (result.isSuccess) {
        const { token, isEmailConfirmed } = result.data
        
        // Token'ı decode ederek kullanıcı bilgilerini al
        const tokenPayload = JSON.parse(atob(token.split('.')[1]))
        
        const userData = {
          id: tokenPayload.nameid,
          role: tokenPayload.role,
          companyId: tokenPayload.CompanyId,
          email,
          isEmailConfirmed
        }

        // State'i güncelle
        setToken(token)
        setUser(userData)
        
        // localStorage'a kaydet
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(userData))
        
        return { success: true, user: userData }
      } else {
        throw new Error(result.message || 'Giriş başarısız')
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const isAuthenticated = () => {
    return !!token && !!user
  }

  const getAuthHeaders = () => {
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated,
    getAuthHeaders
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}