import { lazy, Suspense, useDeferredValue, useEffect, useSyncExternalStore } from 'react'
import PageLoading, { PageLoadBoundary } from './components/PageLoading'
import { loadPage, preloadRoutePage, preloadLinkPage } from './lib/pageModules'
import { applySeo } from './lib/seo'
import { getVisitorCount } from './lib/visitorCount'
import { finishStartup } from './lib/startupScreen'
import { getNavigationLocation, getRestoredProjectScroll, subscribeToNavigation } from './hooks/pageNavigation'
import { isMinimalPage, isMinimalProjectCatalogPage, isProjectCatalogPage, navigationPage, type Page } from './lib/routes'

const Skills = lazy(() => loadPage('skills'))
const Home = lazy(() => loadPage('home'))
const Minimal = lazy(() => loadPage('minimal'))
const MinimalSkills = lazy(() => loadPage('minimalSkills'))
const MinimalProjects = lazy(() => loadPage('minimalProjects'))
const MinimalGreenWay = lazy(() => loadPage('minimalGreenway'))
const MinimalVyora = lazy(() => loadPage('minimalVyora'))
const GreenWay = lazy(() => loadPage('greenway'))
const Vyora = lazy(() => loadPage('vyora'))
const Everwell = lazy(() => loadPage('everwell'))
const MinimalEverwell = lazy(() => loadPage('minimalEverwell'))
const Projects = lazy(() => loadPage('projects'))
const Numbers = lazy(() => loadPage('numbers'))
const AskAI = lazy(() => loadPage('ai'))
const FullExperienceEffects = lazy(() => loadPage('fullExperienceEffects'))

// This mounts after a deferred page resolves, so focus and reveals find its content.
function RenderedPage({ page, route }: { page: Page; route: string }) {
  useEffect(() => {
    document.documentElement.dataset.view = isMinimalPage(page) ? 'minimal' : page
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', document.documentElement.dataset.theme === 'light' ? isMinimalPage(page) ? '#fafafa' : '#f4f3ef' : '#111111')
    finishStartup()
    applySeo(page)
    const restoredScroll = getRestoredProjectScroll()
    if (restoredScroll !== undefined) {
      window.scrollTo({ top: restoredScroll, behavior: 'instant' })
      document.getElementById(`${page}-title`)?.focus({ preventScroll: true })
      return
    }
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
  if (isProjectCatalogPage(page)) return <Projects page={page} route={route} />
  if (isMinimalProjectCatalogPage(page)) return <MinimalProjects page={page} route={route} />
  if (page === 'minimalVyora') return <MinimalVyora />
  if (page === 'vyora') return <Vyora />
  if (page === 'everwell') return <Everwell />
  if (page === 'minimalEverwell') return <MinimalEverwell minimal />
  return page === 'minimal' ? <Minimal /> : page === 'minimalSkills' ? <MinimalSkills /> : page === 'minimalGreenway' ? <MinimalGreenWay /> : page === 'ai' ? <AskAI /> : page === 'numbers' ? <Numbers /> : page === 'greenway' ? <GreenWay /> : page === 'skills' ? <Skills /> : <Home />
}

export default function App() {
  const requestedRoute = useSyncExternalStore(subscribeToNavigation, getNavigationLocation, () => '/')
  const deferredRoute = useDeferredValue(requestedRoute)
  // Keep the current Minimal page painted while the next page's code and CSS load.
  // Full Experience keeps its existing covered handoff and animation timing.
  const route = isMinimalPage(navigationPage(requestedRoute)) && isMinimalPage(navigationPage(deferredRoute)) ? deferredRoute : requestedRoute
  const page = navigationPage(route)

  useEffect(() => {
    if (import.meta.env.PROD) void getVisitorCount().catch(() => { /* The footer handles unavailable counts. */ })
  }, [])

  useEffect(() => {
    const preload = (event: Event) => preloadLinkPage(event.target, event.type === 'click')
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

  return <PageLoadBoundary key={isMinimalPage(page) ? 'minimal' : page} minimal={isMinimalPage(page)}><Suspense fallback={<PageLoading minimal={isMinimalPage(page)} />}><RenderedPage key={page} page={page} route={route} />{!isMinimalPage(page) && <FullExperienceEffects key={page} page={page} />}</Suspense></PageLoadBoundary>
}
