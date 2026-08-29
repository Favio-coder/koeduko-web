import path from 'path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
      '@convex': path.resolve(import.meta.dirname, './convex'),
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react'
          }
          if (id.includes('node_modules/convex')) {
            return 'vendor-convex'
          }
          if (id.includes('node_modules/jspdf') || id.includes('node_modules/html2canvas')) {
            return 'vendor-pdf'
          }
        },
      },
    },
  },
})


