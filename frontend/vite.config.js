import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    historyApiFallback: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@remixicon/react', 'lucide-react'],
        },
      },
    },
    // Production optimizations
    minify: 'terser',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
  },
  // Environment variables
  define: {
    __API_URL__: JSON.stringify(process.env.NODE_ENV === 'production' 
      ? 'https://my-quickshop.com/api' 
      : 'http://localhost:3001/api'
    ),
  },
})
