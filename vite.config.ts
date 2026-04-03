import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      
      // Позволяет видеть манифест в режиме npm run dev
      devOptions: {
        enabled: true,
      },

      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      
      manifest: {
        name: 'Figure Collector App',
        short_name: 'Figures',
        description: 'Моя коллекция аниме-фигурок',
        theme_color: '#0d0d0f',
        background_color: '#0d0d0f',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: '/pwa-192x192.png', // Добавлен слеш для корректного поиска в public
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png', // Добавлен слеш
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png', // Добавлен слеш
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },

      workbox: {
        // Указываем явно, что кэшировать, включая твои разделенные чанки
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,webmanifest}'],
        maximumFileSizeToCacheInBytes: 5000000, // Увеличил до 5МБ, чтобы Firebase точно влез
      }
    })
  ],

  // Фикс для recharts и react-is, чтобы не было ошибок импорта
  optimizeDeps: {
    include: ['react-is', 'recharts', 'lucide-react', 'firebase/app', 'firebase/firestore']
  },

  build: {
    chunkSizeWarningLimit: 1000, // Немного поднял лимит
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Выносим Firebase в отдельный чанк
          if (id.includes('firebase')) {
            return 'firebase-provider';
          }
          // Выносим тяжелый UI (графики и иконки)
          if (id.includes('recharts') || id.includes('lucide-react')) {
            return 'ui-vendors';
          }
          // Все остальное из библиотек
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
});