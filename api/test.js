// Test endpoint - Vercel proxy çalışıyor mu kontrol et
export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept')

    if (req.method === 'OPTIONS') {
        res.status(200).end()
        return
    }

    try {
        // Test API connection
        const response = await fetch('http://193.111.77.142/api/City/CityGetAll', {
            method: 'GET',
            headers: {
                'Accept': 'text/plain',
            }
        })

        const data = await response.text()

        res.status(200).json({
            success: true,
            message: 'Vercel proxy working!',
            apiResponse: data,
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        })
    }
}