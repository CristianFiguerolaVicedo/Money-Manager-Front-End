import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // No manualChunks: forcing recharts and React into separate files made the charts file run before React
  // existed ("Cannot read properties of undefined (reading 'forwardRef')") and the page stayed blank.
  // Pages are still loaded on demand (React.lazy in App.jsx), and Vite splits shared code by itself.
  server: {
    // Same as the Netlify proxy in production: the API is reached on the web's own origin
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})
