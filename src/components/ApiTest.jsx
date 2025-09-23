import { useState } from 'react'
import { getApiUrl } from '../utils/api'

const ApiTest = () => {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testApi = async () => {
    setLoading(true)
    try {
      const response = await fetch(getApiUrl('/City/CityGetAll'))
      const data = await response.json()
      setResult(JSON.stringify(data, null, 2))
    } catch (error) {
      setResult(`Error: ${error.message}`)
    }
    setLoading(false)
  }

  const testVercelProxy = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test')
      const data = await response.json()
      setResult(JSON.stringify(data, null, 2))
    } catch (error) {
      setResult(`Error: ${error.message}`)
    }
    setLoading(false)
  }

  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-bold mb-4">API Test</h3>
      <div className="space-x-2 mb-4">
        <button 
          onClick={testApi}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Test API Direct
        </button>
        <button 
          onClick={testVercelProxy}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
        >
          Test Vercel Proxy
        </button>
      </div>
      <div className="text-xs">
        <strong>Current URL:</strong> {getApiUrl('/City/CityGetAll')}
      </div>
      <div className="text-xs mb-2">
        <strong>Environment:</strong> {import.meta.env.PROD ? 'Production' : 'Development'}
      </div>
      <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-64">
        {loading ? 'Loading...' : result || 'Click a button to test'}
      </pre>
    </div>
  )
}

export default ApiTest