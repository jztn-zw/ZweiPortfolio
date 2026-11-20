import { preload } from 'react-dom'
import { isMinimalPage, isMinimalProjectCatalogPage, isPagePath, isProjectCatalogPage, navigationPage } from './routes'

const loaders = {
  home: () => {
    preload('/images/jaztin-portrait.webp', { as: 'image', type: 'image/webp', fetchPriority: 'high' })
    return import('../pages/Home')
  },
  minimal: () => import('../pages/Minimal'),
  minimalSkills: () => import('../pages/MinimalSkills'),
  minimalProjects: () => import('../pages/MinimalProjects'),
  minimalGreenway: () => import('../pages/MinimalGreenWay'),
  minimalVyora: () => import('../pages/MinimalVyora'),
  minimalEverwell: () => import('../pages/Everwell'),
  skills: () => import('../pages/Skills'),
  projects: () => import('../pages/Projects'),
  greenway: () => import('../pages/GreenWay'),
  vyora: () => import('../pages/Vyora'),
  everwell: () => import('../pages/Everwell'),
  numbers: () => import('../pages/Numbers'),
  ai: () => import('../pages/AskAI'),
  fullExperienceEffects: () => import('../components/FullExperienceEffects'),
}
type DeferredPage = keyof typeof loaders
const pending: Partial<Record<DeferredPage, ReturnType<typeof loaders[DeferredPage]>>> = {}

export function loadPage<P extends DeferredPage>(page: P): ReturnType<typeof loaders[P]> {
  const request = pending[page] ??= loaders[page]().catch(error => {
    delete pending[page]
    throw error
  })
  if (page !== 'fullExperienceEffects' && !isMinimalPage(page)) {
    // Fetch the shared styles and effects alongside the full page, even on a direct visit.
    void loadPage('fullExperienceEffects').catch(() => { /* The page boundary handles a failed load. */ })
  }
  // Each cache entry comes from the loader with the same page key.
  return request as ReturnType<typeof loaders[P]>
}

// Pointer, keyboard and touch intent start the download during the existing curtain.
export function preloadLinkPage(target: EventTarget | null, activated = false) {
  if (!(target instanceof Element)) return
  const link = target.closest<HTMLAnchorElement>('a[href]')
  if (!link) return
  const url = new URL(link.href, window.location.href)
  if (url.origin !== window.location.origin || !isPagePath(url.pathname)) return
  const targetRoute = url.pathname + url.search + url.hash
  if (!activated && isMinimalPage(navigationPage(window.location.href)) && !isMinimalPage(navigationPage(targetRoute))) return
  preloadRoutePage(targetRoute)
}

export function preloadRoutePage(href: string) {
  void loadRouteResources(href).catch(() => { /* Navigation shows a retry if the connection fails. */ })
}

export async function loadRouteResources(href: string) {
  const page = navigationPage(href)
  const module = isProjectCatalogPage(page) ? 'projects' : isMinimalProjectCatalogPage(page) ? 'minimalProjects' : page
  const pageRequest = loadPage(module)
  if (isMinimalPage(page)) await pageRequest
  else await Promise.all([pageRequest, loadPage('fullExperienceEffects')])
}
