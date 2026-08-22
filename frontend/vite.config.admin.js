import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Admin portal — served at /admin/ in production, dev on port 3001
export default defineConfig({
  plugins: [react()],
  root: '.',
  // In production the admin portal is mounted at /admin/ by FastAPI.
  // During dev (port 3001) base is / so hot reload works without path issues.
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
    strictPort: true,
    proxy: {
      '/api': { target: 'http://localhost:8000', changeOrigin: true },
      '/auth': { target: 'http://localhost:8000', changeOrigin: true },
      '/credential': { target: 'http://localhost:8000', changeOrigin: true },
      '/admin': { target: 'http://localhost:8000', changeOrigin: true },
    },
  },
})
