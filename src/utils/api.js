// API base URL - environment variable'dan al, yoksa development fallback kullan
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.mutlugunum.com.tr'

export const getApiUrl = (endpoint) => {
  // Her zaman API_BASE_URL kullan (Coolify için)
  return `${API_BASE_URL}/api${endpoint}`
}

export const getImageUrl = (imagePath) => {
  if (!imagePath || imagePath === '') {
    return 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
  }
  
  // Her zaman API_BASE_URL kullan (Coolify için)
  return `${API_BASE_URL}${imagePath}`
}