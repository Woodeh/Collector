import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Увеличиваем лимит предупреждения о размере чанка до 800 кб
    chunkSizeWarningLimit: 800,
    
    rollupOptions: {
      output: {
        // Логика разделения кода на части (Manual Chunking)
        manualChunks(id) {
          // Выносим Firebase в отдельный файл (он самый тяжелый)
          if (id.includes('firebase')) {
            return 'firebase-provider';
          }
          // Выносим библиотеки графиков и иконок
          if (id.includes('recharts') || id.includes('lucide-react')) {
            return 'ui-vendors';
          }
          // Все остальные зависимости из node_modules в один общий файл
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
});