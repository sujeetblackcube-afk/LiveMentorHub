import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  base: '/admin',
  plugins: [react(), tailwindcss()],
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
  define: {
    'process.env': {},
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
          pdf: ['jspdf', 'jspdf-autotable'],
          excel: ['xlsx'],
          icons: ['lucide-react'],
        },
      },
    },
  },
});
