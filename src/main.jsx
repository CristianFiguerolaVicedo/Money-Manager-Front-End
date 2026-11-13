import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AppContextProvider } from './context/AppContext.jsx'
import { warmUpServer } from './util/serverWakeNotice.js'
import { initTheme } from './util/theme.js'
import { restoreSession } from './util/session.js'

// After a new deploy, a tab opened earlier may ask for page files that no longer exist: reload once to get the new ones
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault()
  try {
    if (sessionStorage.getItem('reloaded-after-deploy')) return
    sessionStorage.setItem('reloaded-after-deploy', '1')
  } catch {
    // Storage blocked: reload anyway
  }
  window.location.reload()
})
// Allow it again once the app has run fine for a while (never a reload loop if a file is really broken)
setTimeout(() => {
  try { sessionStorage.removeItem('reloaded-after-deploy') } catch { /* ignore */ }
}, 30000)

warmUpServer()
initTheme()
restoreSession()

createRoot(document.getElementById('root')).render(
  <AppContextProvider>
    <App />
  </AppContextProvider>
)
