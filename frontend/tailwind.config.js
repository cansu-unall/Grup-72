/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#4A90E2', // Sakin bir mavi tonu
        'secondary': '#F5A623', // Sıcak bir turuncu (başarı bildirimleri için)
        'light-bg': '#F7F9FC', // Çok açık gri arka plan
        'dark-text': '#333333', // Okunabilir koyu metin
      },
      fontFamily: {
        // Okunabilirliği yüksek, disleksi dostu fontlar tercih edilebilir
        sans: ['"Inter"', 'sans-serif'],
      },
      fontSize: {
        'base': '1.1rem', // Varsayılan yazı tipi boyutunu biraz büyütüyoruz
        'lg': '1.25rem',
        'xl': '1.5rem',
        '2xl': '1.875rem',
      }
    },
  },
  plugins: [],
}