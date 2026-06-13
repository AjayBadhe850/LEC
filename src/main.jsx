import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AppProvider } from './context/AppContext.jsx'
import { Analytics } from '@vercel/analytics/react'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProvider>
      <App />
      <Analytics />
    </AppProvider>
  </StrictMode>,
)