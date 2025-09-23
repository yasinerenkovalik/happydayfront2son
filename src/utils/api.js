// API base URL - production'da Vercel proxy kullanır, development'ta direkt API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://193.111.77.142'

export const getApiUrl = (endpoint) => {
  // Production'da (Vercel'de) proxy kullan
  if (import.meta.env.PROD || window.location.protocol === 'https:') {
    // HTTPS sitede proxy kullan (vercel.json'da tanımlı)
    return `/api${endpoint}`
  }
  // Development'ta direkt API'yi kullan
  return `${API_BASE_URL}/api${endpoint}`
}

export const getImageUrl = (imagePath) => {
  if (!imagePath || imagePath === '') {
    return 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
  }
  
  // Production'da (Vercel'de) proxy kullan
  if (import.meta.env.PROD || window.location.protocol === 'https:') {
    return `/api-static${imagePath}`
  }
  // Development'ta direkt sunucuyu kullan
  return `${API_BASE_URL}${imagePath}`
}