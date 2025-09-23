/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Ana Renk Paleti
        "primary": "#F8BBD0",        // Pastel Pembe - Ana renk
        "secondary": "#F5E6CC",      // Şampanya/Açık Bej - İkincil renk
        "accent": "#D4AF37",         // Altın - Vurgu rengi
        
        // Light Mode Renkleri
        "background-light": "#FFFFFF",     // Beyaz arka plan
        "background-secondary-light": "#F2F2F2", // Açık gri ikincil arka plan
        "content-light": "#2D2D2D",       // Koyu gri metin
        "subtle-light": "#6B7280",        // Orta gri alt metin
        "border-light": "#E5E7EB",        // Açık gri border
        
        // Dark Mode Renkleri (uyumlu tonlar)
        "background-dark": "#1F1F1F",      // Koyu arka plan
        "background-secondary-dark": "#2D2D2D", // Koyu gri ikincil arka plan
        "content-dark": "#F9FAFB",        // Açık metin
        "subtle-dark": "#9CA3AF",         // Orta gri alt metin
        "border-dark": "#374151",         // Koyu gri border
        
        // Özel Renk Tonları
        "primary-light": "#FCE4EC",       // Çok açık pembe
        "primary-dark": "#E91E63",        // Koyu pembe
        "secondary-light": "#FDF6E3",     // Çok açık bej
        "secondary-dark": "#D4B896",      // Koyu bej
        "accent-light": "#F7E98E",        // Açık altın
        "accent-dark": "#B8860B",         // Koyu altın
        
        // Durum Renkleri (uyumlu tonlar)
        "success": "#10B981",             // Yeşil
        "warning": "#F59E0B",             // Turuncu
        "error": "#EF4444",               // Kırmızı
        "info": "#3B82F6"                 // Mavi
      },
      fontFamily: {
        "display": ["Inter", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.5rem",
        "lg": "1rem",
        "xl": "1.5rem",
        "full": "9999px"
      }
    }
  },
  plugins: [],
}