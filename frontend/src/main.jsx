import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './styles/global-styles.css'
import './store/templates/jupiter/styles/jupiter.css'
import './i18n'
import App from './App.jsx'
import './utils/testConnection.js'

// Import default fonts
import '@fontsource/noto-sans-hebrew/400.css'
import '@fontsource/noto-sans-hebrew/500.css'
import '@fontsource/noto-sans-hebrew/600.css'
import '@fontsource/noto-sans-hebrew/700.css'

// Set initial direction based on default language
document.documentElement.dir = 'rtl'
document.documentElement.lang = 'he'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
