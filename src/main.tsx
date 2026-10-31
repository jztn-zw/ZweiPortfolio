import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import './theme.css'
import './theme-light.css'
import './interaction-polish.css'
import './performance.css'
import './minimal-theme.css'
import { initializeEffectsMode } from './lib/devicePerformance'

initializeEffectsMode()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
