// Vercel Serverless Function - API Proxy
export default async function handler(req, res) {
  const { method, url, headers, body } = req
  
  // API base URL
  const API_BASE = 'http://193.111.77.142'
  
  // Extract the path after /api/proxy
  const path = req.url.replace('/api/proxy', '')
  const targetUrl = `${API_BASE}/api${path}`
  
  try {
    // Forward the request to the actual API
    const response = await fetch(targetUrl, {
      method,
      headers: {
        ...headers,
        host: undefined, // Remove host header
        'x-forwarded-for': undefined,
        'x-forwarded-proto': undefined,
        'x-vercel-id': undefined,
      },
      body: method !== 'GET' && method !== 'HEAD' ? body : undefined,
    })
    
    // Get response data
    const data = await response.text()
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept')
    
    // Handle preflight requests
    if (method === 'OPTIONS') {
      res.status(200).end()
      return
    }
    
    // Forward response
    res.status(response.status)
    
    // Set content type if available
    const contentType = response.headers.get('content-type')
    if (contentType) {
      res.setHeader('Content-Type', contentType)
    }
    
    res.send(data)
    
  } catch (error) {
    console.error('Proxy error:', error)
    res.status(500).json({ error: 'Proxy error', message: error.message })
  }
}