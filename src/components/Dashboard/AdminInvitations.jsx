import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getApiUrl } from '../../utils/api'

const AdminInvitations = () => {
    const { user } = useAuth()

    const [formData, setFormData] = useState({
        email: '',
        companyNameHint: '',
        expiresAt: ''
    })
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [generatedLink, setGeneratedLink] = useState('')

    useEffect(() => {
        // Varsayılan tarih (1 hafta sonra) - UTC olarak
        const nextWeek = new Date()
        nextWeek.setDate(nextWeek.getDate() + 7)
        // Local timezone'dan UTC'ye çevir
        const utcDate = new Date(nextWeek.getTime() - nextWeek.getTimezoneOffset() * 60000)
        setFormData(prev => ({
            ...prev,
            expiresAt: utcDate.toISOString().slice(0, 16)
        }))
    }, [])

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')
        setError('')
        setGeneratedLink('')

        try {
            // Header'ları temiz olarak oluştur
            const headers = {
                'Accept': '*/*',
                'Content-Type': 'application/json'
            }

            // JWT Token'ı ekle
            const currentToken = user?.token || localStorage.getItem('token')
            if (currentToken) {
                // Token'ın sadece JWT kısmını al
                let cleanToken = currentToken

                // Eğer token JSON string ise parse et
                if (typeof currentToken === 'string' && currentToken.startsWith('{')) {
                    try {
                        const parsed = JSON.parse(currentToken)
                        cleanToken = parsed.data?.token || parsed.token || currentToken
                    } catch (e) {
                        console.log('Token parsing failed, using original')
                    }
                }

                // Authorization header'ını ekle
                headers.Authorization = `Bearer ${cleanToken}`
            }

            // Tarihi UTC formatına çevir
            const expiresAtUTC = new Date(formData.expiresAt).toISOString()

            const requestData = {
                email: formData.email,
                companyNameHint: formData.companyNameHint,
                expiresAt: expiresAtUTC
            }

            const response = await fetch(getApiUrl('/admin/invitations/create'), {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(requestData)
            })

            if (response.ok) {
                let tokenResponse = await response.text()

                // Token response'unu parse et
                let actualToken = tokenResponse
                try {
                    // Eğer JSON string ise parse et
                    const parsed = JSON.parse(tokenResponse)
                    actualToken = parsed.token || tokenResponse
                } catch (e) {
                    // JSON değilse direkt kullan
                    actualToken = tokenResponse
                }

                // Token ile kayıt linki oluştur
                const registrationLink = `${window.location.origin}/company/register?token=${encodeURIComponent(actualToken)}&email=${encodeURIComponent(formData.email)}`

                setMessage('Davet linki başarıyla oluşturuldu!')
                setGeneratedLink(registrationLink)

                // Formu temizle
                const nextWeekUTC = new Date()
                nextWeekUTC.setDate(nextWeekUTC.getDate() + 7)
                const utcDateForReset = new Date(nextWeekUTC.getTime() - nextWeekUTC.getTimezoneOffset() * 60000)

                setFormData({
                    email: '',
                    companyNameHint: '',
                    expiresAt: utcDateForReset.toISOString().slice(0, 16)
                })
            } else {
                const errorText = await response.text()
                setError(errorText || 'Token oluşturulurken bir hata oluştu.')
            }
        } catch (error) {
            console.error('Token oluşturma hatası:', error)
            setError('Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.')
        } finally {
            setLoading(false)
        }
    }

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            alert('Link panoya kopyalandı!')
        }).catch(() => {
            alert('Kopyalama başarısız!')
        })
    }

    return (
        <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-red-600 text-2xl">add_link</span>
                <h2 className="text-2xl font-bold text-content-light dark:text-content-dark">
                    Şirket Davet Linki Oluştur
                </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                        Email Adresi
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="ornek@sirket.com"
                        disabled={loading}
                    />
                </div>

                <div>
                    <label htmlFor="companyNameHint" className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                        Şirket Adı İpucu
                    </label>
                    <input
                        type="text"
                        id="companyNameHint"
                        name="companyNameHint"
                        value={formData.companyNameHint}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Örnek Organizasyon Ltd."
                        disabled={loading}
                    />
                </div>

                <div>
                    <label htmlFor="expiresAt" className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                        Son Kullanma Tarihi (UTC)
                    </label>
                    <input
                        type="datetime-local"
                        id="expiresAt"
                        name="expiresAt"
                        required
                        value={formData.expiresAt}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        disabled={loading}
                    />
                    <p className="text-xs text-subtle-light dark:text-subtle-dark mt-1">
                        Tarih UTC timezone'ında kaydedilecektir
                    </p>
                </div>

                {message && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                        <div className="flex items-center">
                            <span className="material-symbols-outlined text-green-600 dark:text-green-400 mr-2">check_circle</span>
                            <p className="text-green-800 dark:text-green-200 text-sm">{message}</p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <div className="flex items-center">
                            <span className="material-symbols-outlined text-red-600 dark:text-red-400 mr-2">error</span>
                            <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
                        </div>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Token Oluşturuluyor...</span>
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined text-sm">add_link</span>
                            <span>Davet Linki Oluştur</span>
                        </>
                    )}
                </button>
            </form>

            {/* Oluşturulan Link */}
            {generatedLink && (
                <div className="mt-8 p-6 bg-background-light/50 dark:bg-background-dark/50 rounded-lg border border-border-light dark:border-border-dark">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="material-symbols-outlined text-green-600">link</span>
                        <h3 className="text-lg font-semibold text-content-light dark:text-content-dark">
                            Oluşturulan Davet Linki
                        </h3>
                    </div>

                    <div className="bg-background-light dark:bg-background-dark p-4 rounded-lg border border-border-light dark:border-border-dark">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-content-light dark:text-content-dark break-all mr-4">
                                {generatedLink}
                            </p>
                            <button
                                onClick={() => copyToClipboard(generatedLink)}
                                className="flex items-center gap-2 px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex-shrink-0"
                            >
                                <span className="material-symbols-outlined text-sm">content_copy</span>
                                Kopyala
                            </button>
                        </div>
                    </div>

                    <p className="text-xs text-subtle-light dark:text-subtle-dark mt-2">
                        Bu linki şirkete gönderin. Link ile kayıt olabilecekler.
                    </p>
                </div>
            )}
        </div>
    )
}

export default AdminInvitations