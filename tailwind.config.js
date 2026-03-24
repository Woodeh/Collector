/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        // Анимация глитча (смещения тени)
        'glitch-skew': {
          '0%, 100%': { transform: 'skew(0deg)', textShadow: '2px 0 #3b82f6, -2px 0 #ec4899' },
          '10%': { transform: 'skew(1deg)', textShadow: '3px 0 #3b82f6, -3px 0 #ec4899' },
          '20%': { transform: 'skew(-1deg)', textShadow: '1px 0 #3b82f6, -1px 0 #ec4899' },
          '30%': { transform: 'skew(0deg)' },
        },
        // Анимация сканирующей линии
        'scanline': {
          '0%': { top: '0%' },
          '100%': { top: '100%' },
        },
      },
      animation: {
        'glitch-skew': 'glitch-skew 1s infinite linear alternate-reverse',
        'scanline': 'scanline 3s linear infinite',
      },
    },
  },
  plugins: [],
}