import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // UI libraries
          'ui-vendor': ['lucide-react', 'react-hot-toast', 'clsx'],
          // Form and data fetching
          'form-vendor': ['react-hook-form', '@tanstack/react-query'],
          // Date and i18n
          'util-vendor': ['date-fns', 'react-i18next', 'i18next'],
          // Maps and charts (if used)
          'heavy-vendor': ['qrcode.react', 'zustand'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});
