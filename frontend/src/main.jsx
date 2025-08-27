import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './store/jupiter.css'
import './i18n'
import App from './App.jsx'
import './utils/testConnection.js'

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
