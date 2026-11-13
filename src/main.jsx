import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AppContextProvider } from './context/AppContext.jsx'
import { warmUpServer } from './util/serverWakeNotice.js'
import { initTheme } from './util/theme.js'
import { restoreSession } from './util/session.js'

warmUpServer()
initTheme()
restoreSession()

createRoot(document.getElementById('root')).render(
  <AppContextProvider>
    <App />
  </AppContextProvider>
)
