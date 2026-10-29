import { lazy, Suspense, useEffect, useSyncExternalStore } from 'react'
import Home from './pages/Home'
import PageLoading, { PageLoadBoundary } from './components/PageLoading'
import { loadPage, preloadRoutePage, preloadLinkPage } from './lib/pageModules'
import { portfolio } from './data/portfolio'
import { getVisitorCount } from './lib/visitorCount'
import useScrollReveal from './hooks/useScrollReveal'
import useAnimationVisibility from './hooks/useAnimationVisibility'
import { getNavigationLocation, subscribeToNavigation } from './hooks/pageNavigation'
import { navigationPage, type Page } from './lib/routes'

const Skills = lazy(() => loadPage('skills'))
const GreenWay = lazy(() => loadPage('greenway'))
const Numbers = lazy(() => loadPage('numbers'))

// This mounts after a deferred page resolves, so focus and reveals find its content.
function RenderedPage({ page }: { page: Page }) {
  useEffect(() => {
    document.title = `${portfolio.name} — ${page === 'numbers' ? 'By the Numbers' : page === 'greenway' ? 'GreenWay' : page === 'skills' ? 'Stack & Skills' : portfolio.role}`
    let anchor = window.location.hash.slice(1)
    try { anchor = decodeURIComponent(anchor) } catch { /* Keep malformed fragments literal. */ }
    if (anchor) {
      const target = document.getElementById(anchor)
      target?.scrollIntoView({ behavior: 'instant', block: 'start' })
      target?.focus({ preventScroll: true })
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' })
      if (page !== 'home') document.getElementById(`${page}-title`)?.focus({ preventScroll: true })
    }
  }, [page])
  useScrollReveal(page)
  useAnimationVisibility(page)
  return page === 'numbers' ? <Numbers /> : page === 'greenway' ? <GreenWay /> : page === 'skills' ? <Skills /> : <Home />
}

export default function App() {
  const route = useSyncExternalStore(subscribeToNavigation, getNavigationLocation, () => '/')
  const page = navigationPage(route)

  useEffect(() => {
    if (import.meta.env.PROD) void getVisitorCount().catch(() => { /* The footer handles unavailable counts. */ })
  }, [])

  useEffect(() => {
    const preload = (event: Event) => preloadLinkPage(event.target)
    document.addEventListener('pointerover', preload, { passive: true })
    document.addEventListener('focusin', preload)
    document.addEventListener('pointerdown', preload, { passive: true })
    document.addEventListener('click', preload)
    const preloadDestination = () => preloadRoutePage(window.location.pathname + window.location.search + window.location.hash)
    window.addEventListener('popstate', preloadDestination)
    window.addEventListener('hashchange', preloadDestination)
    return () => {
      document.removeEventListener('pointerover', preload)
      document.removeEventListener('focusin', preload)
      document.removeEventListener('pointerdown', preload)
      document.removeEventListener('click', preload)
      window.removeEventListener('popstate', preloadDestination)
      window.removeEventListener('hashchange', preloadDestination)
    }
  }, [])

  return <PageLoadBoundary key={page}><Suspense fallback={<PageLoading />}><RenderedPage page={page} /></Suspense></PageLoadBoundary>
}
