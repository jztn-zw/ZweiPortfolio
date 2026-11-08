import { lazy, Suspense, useEffect, useSyncExternalStore } from 'react'
import PageLoading, { PageLoadBoundary } from './components/PageLoading'
import { loadPage, preloadRoutePage, preloadLinkPage } from './lib/pageModules'
import { portfolio } from './data/portfolio'
import { getVisitorCount } from './lib/visitorCount'
import { finishStartup } from './lib/startupScreen'
import useScrollReveal from './hooks/useScrollReveal'
import useAnimationVisibility from './hooks/useAnimationVisibility'
import useSurfaceHover from './hooks/useSurfaceHover'
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
const Projects = lazy(() => loadPage('projects'))
const Numbers = lazy(() => loadPage('numbers'))
const AskAI = lazy(() => loadPage('ai'))

const pageTitles: Record<Page, string> = {
  home: portfolio.role,
  minimal: 'Minimal Portfolio',
  minimalSkills: 'Tech Stack — Minimal',
  minimalProjects: 'All Projects — Minimal',
  minimalWebMobileProjects: 'Web & Mobile — Minimal',
  minimalAutomationProjects: 'Automation — Minimal',
  minimalToolsProjects: 'Tools & Experiments — Minimal',
  minimalGreenway: 'GreenWay — Minimal',
  minimalVyora: 'VYORA — Minimal',
  ai: 'Ask Me Anything',
  numbers: 'By the Numbers',
  greenway: 'GreenWay',
  skills: 'Stack & Skills',
  projects: 'All Projects',
  webMobileProjects: 'Web & Mobile Projects',
  automationProjects: 'Automation Projects',
  toolsProjects: 'Tools & Experiments',
}

// This mounts after a deferred page resolves, so focus and reveals find its content.
function RenderedPage({ page, route }: { page: Page; route: string }) {
  useEffect(() => {
    document.documentElement.dataset.view = isMinimalPage(page) ? 'minimal' : page
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', document.documentElement.dataset.theme === 'light' ? isMinimalPage(page) ? '#fafafa' : '#f4f3ef' : '#111111')
    finishStartup()
    document.title = `${portfolio.name} — ${pageTitles[page]}`
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
  const effectsPage = isMinimalPage(page) ? 'minimal' : page
  useScrollReveal(effectsPage)
  useAnimationVisibility(effectsPage)
  useSurfaceHover(effectsPage)
  if (isProjectCatalogPage(page)) return <Projects page={page} route={route} />
  if (isMinimalProjectCatalogPage(page)) return <MinimalProjects page={page} route={route} />
  if (page === 'minimalVyora') return <MinimalVyora />
  return page === 'minimal' ? <Minimal /> : page === 'minimalSkills' ? <MinimalSkills /> : page === 'minimalGreenway' ? <MinimalGreenWay /> : page === 'ai' ? <AskAI /> : page === 'numbers' ? <Numbers /> : page === 'greenway' ? <GreenWay /> : page === 'skills' ? <Skills /> : <Home />
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

  return <PageLoadBoundary key={page} minimal={isMinimalPage(page)}><Suspense fallback={<PageLoading minimal={isMinimalPage(page)} />}><RenderedPage page={page} route={route} /></Suspense></PageLoadBoundary>
}
