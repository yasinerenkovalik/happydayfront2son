// İletişim bilgileri - Tek yerden yönetim
export const CONTACT_INFO = {
    phone: '+90 551 100 1014',
    whatsapp: '+90 551 100 1014',
    email: 'mutlugunumsosyal@gmail.com',
    instagram: '@mutlugunum.co',
    instagramUrl: 'https://instagram.com/mutlugunum.co',
    address: 'Kocaeli, Türkiye',
    workingHours: 'Pazartesi - Cuma: 09:00 - 18:00'
}

// WhatsApp mesaj şablonları
export const WHATSAPP_MESSAGES = {
    general: 'Merhaba! Mutlu Günüm hakkında bilgi almak istiyorum.',
    organization: 'Merhaba! Organizasyon hizmetleriniz hakkında bilgi almak istiyorum.',
    quote: 'Merhaba! Teklif almak istiyorum.'
}

// WhatsApp URL oluşturucu
export const getWhatsAppUrl = (message = WHATSAPP_MESSAGES.general) => {
    const phoneNumber = CONTACT_INFO.whatsapp.replace(/\s+/g, '').replace('+', '')
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
}