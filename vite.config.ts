import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      devOptions: {
        enabled: true, // Помогает отлаживать PWA локально
      },
      includeAssets: [
        'favicon.ico', 
        'apple-touch-icon.png', 
        'mask-icon.svg', 
        'pwa-192x192.png', 
        'pwa-512x512.png'
      ],
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
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        maximumFileSizeToCacheInBytes: 5000000,
        // Это КРИТИЧЕСКИ ВАЖНО: заставляем Service Worker игнорировать спец-пути Firebase
        navigateFallbackDenylist: [/^\/__/],
      }
    })
  ],
  optimizeDeps: {
    // Добавляем основные модули в оптимизацию, чтобы Vite не "тупил" при их загрузке
    include: ['react-is', 'recharts', 'lucide-react', 'firebase/app', 'firebase/auth', 'firebase/firestore']
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Упростили manualChunks, чтобы избежать ошибок с циклическими зависимостями
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
});