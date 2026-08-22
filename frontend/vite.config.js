import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Client & Unified frontend development server (default port 3000)
export default defineConfig({
  plugins: [react()],
  root: '.',
  build: {
    outDir: 'dist/client',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    proxy: {
      '/api': { target: 'http://localhost:8000', changeOrigin: true },
      '/auth': { target: 'http://localhost:8000', changeOrigin: true },
      '/terms': { target: 'http://localhost:8000', changeOrigin: true },
      '/credential': { target: 'http://localhost:8000', changeOrigin: true },
      '/institution': { target: 'http://localhost:8000', changeOrigin: true },
      '/admin': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        bypass: (req) => {
          // If browser is requesting HTML page /admin, serve frontend SPA instead of proxying
          if (req.headers.accept && req.headers.accept.includes('text/html')) {
            return '/index.html'
          }
        },
      },
      '/trust': { target: 'http://localhost:8000', changeOrigin: true },
      '/audit': { target: 'http://localhost:8000', changeOrigin: true },
      '/ws': {
        target: 'ws://localhost:8000',
        ws: true,
        changeOrigin: true,
      },
    },
  },
})
