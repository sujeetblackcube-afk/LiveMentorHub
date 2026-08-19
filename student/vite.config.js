import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  base: '/student',
  plugins: [react(), tailwindcss()],
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
  define: {
    'process.env': {},
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://clussplus.auby.in',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  esbuild: {
    legalComments: 'none',
    drop: ['console', 'debugger'],
  },
  build: {
    target: 'esnext',
    cssTarget: 'esnext',
    sourcemap: false,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          agora: ['agora-rtc-sdk-ng'],
          icons: ['lucide-react'],
        },
      },
    },
  },
});
