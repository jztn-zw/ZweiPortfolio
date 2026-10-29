import { lazy, Suspense, useEffect, useSyncExternalStore } from 'react'
import Home from './pages/Home'
import PageLoading, { PageLoadBoundary } from './components/PageLoading'
import { loadPage, preloadHashPage, preloadLinkPage } from './lib/pageModules'
import { portfolio } from './data/portfolio'
import { getVisitorCount } from './lib/visitorCount'
import useScrollReveal from './hooks/useScrollReveal'
import useAnimationVisibility from './hooks/useAnimationVisibility'
import { getNavigationHash, subscribeToNavigation } from './hooks/pageNavigation'

const Skills = lazy(() => loadPage('skills'))
const GreenWay = lazy(() => loadPage('greenway'))
const Numbers = lazy(() => loadPage('numbers'))

type Page = 'home' | 'skills' | 'greenway' | 'numbers'

// This mounts after a deferred page resolves, so focus and reveals find its content.
function RenderedPage({ page }: { page: Page }) {
  useEffect(() => {
    document.title = `${portfolio.name} — ${page === 'numbers' ? 'By the Numbers' : page === 'greenway' ? 'GreenWay' : page === 'skills' ? 'Stack & Skills' : portfolio.role}`
    if (page !== 'home') {
      window.scrollTo({ top: 0, behavior: 'instant' })
      document.getElementById(`${page}-title`)?.focus({ preventScroll: true })
    } else {
      document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ behavior: 'instant', block: 'start' })
    }
  }, [page])
  useScrollReveal(page)
  useAnimationVisibility(page)
  return page === 'numbers' ? <Numbers /> : page === 'greenway' ? <GreenWay /> : page === 'skills' ? <Skills /> : <Home />
}

export default function App() {
  const hash = useSyncExternalStore(subscribeToNavigation, getNavigationHash, () => '')
  const isSkillsPage = hash === '#/skills' || hash === '#/skills/content'
  const isGreenWayPage = hash === '#/projects/greenway' || hash === '#/projects/greenway/content'
  const isNumbersPage = hash === '#/numbers' || hash === '#/numbers/content'
  const page = isNumbersPage ? 'numbers' : isGreenWayPage ? 'greenway' : isSkillsPage ? 'skills' : 'home'

  useEffect(() => {
    if (import.meta.env.PROD) void getVisitorCount().catch(() => { /* The footer handles unavailable counts. */ })
  }, [])

  useEffect(() => {
    const preload = (event: Event) => preloadLinkPage(event.target)
    document.addEventListener('pointerover', preload, { passive: true })
    document.addEventListener('focusin', preload)
    document.addEventListener('pointerdown', preload, { passive: true })
    const preloadDestination = () => preloadHashPage(window.location.hash)
    window.addEventListener('hashchange', preloadDestination)
    return () => {
      document.removeEventListener('pointerover', preload)
      document.removeEventListener('focusin', preload)
      document.removeEventListener('pointerdown', preload)
      window.removeEventListener('hashchange', preloadDestination)
    }
  }, [])

  return <PageLoadBoundary key={page}><Suspense fallback={<PageLoading />}><RenderedPage page={page} /></Suspense></PageLoadBoundary>
}
