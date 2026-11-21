import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './base.css'
import App from './App.tsx'
import './minimal-theme.css'
import './hooks/pageNavigation.css'
import { initializeEffectsMode } from './lib/devicePerformance'
import { loadRouteResources } from './lib/pageModules'
import { isMinimalPage, navigationPage } from './lib/routes'

initializeEffectsMode()

const root = document.getElementById('root')!
const mount = () => createRoot(root).render(<StrictMode><App /></StrictMode>)
// Leave the readable static page painted until its interactive module is ready.
if (root.hasChildNodes() && isMinimalPage(navigationPage(window.location.href))) {
  void loadRouteResources(window.location.href).then(mount, mount)
} else mount()
