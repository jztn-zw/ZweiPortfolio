import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './base.css'
import App from './App.tsx'
import './minimal-theme.css'
import { initializeEffectsMode } from './lib/devicePerformance'

initializeEffectsMode()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
