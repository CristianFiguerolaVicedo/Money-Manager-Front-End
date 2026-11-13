import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        // Big libraries in their own files: they change less often than the app (better caching) and
        // only the pages that use them download them (charts, emoji picker)
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('recharts') || id.includes('d3-') || id.includes('victory-vendor')) return 'charts'
          if (id.includes('emoji-picker-react')) return 'emoji-picker'
          if (/[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(id)) return 'react'
          return undefined
        },
      },
    },
  },
  server: {
    // Same as the Netlify proxy in production: the API is reached on the web's own origin
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})
