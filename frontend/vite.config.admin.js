import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dedicated Admin Portal dev server (default port 3001)
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'admin-dev-rewrite',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/' || req.url === '/index.html' || req.url === '/admin' || req.url === '/admin/') {
            req.url = '/admin.html'
          }
          next()
        })
      }
    }
  ],
  root: '.',
  base: process.env.NODE_ENV === 'production' ? '/admin/' : '/',
  build: {
    outDir: 'dist/admin',
    emptyOutDir: true,
    rollupOptions: {
      input: 'admin.html',
    },
  },
  server: {
    port: 3001,
    proxy: {
      '/api': { target: 'http://localhost:8000', changeOrigin: true },
      '/auth': { target: 'http://localhost:8000', changeOrigin: true },
      '/credential': { target: 'http://localhost:8000', changeOrigin: true },
      '/admin': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        bypass: (req) => {
          if (req.headers.accept && req.headers.accept.includes('text/html')) {
            return '/admin.html'
          }
        },
      },
    },
  },
})
