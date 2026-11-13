import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Same as the Netlify proxy in production: the API is reached on the web's own origin
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})
