import { isMinimalProjectCatalogPage, isPagePath, isProjectCatalogPage, navigationPage } from './routes'

const loaders = {
  home: () => import('../pages/Home'),
  minimal: () => import('../pages/Minimal'),
  minimalSkills: () => import('../pages/MinimalSkills'),
  minimalProjects: () => import('../pages/MinimalProjects'),
  minimalGreenway: () => import('../pages/MinimalGreenWay'),
  minimalVyora: () => import('../pages/MinimalVyora'),
  skills: () => import('../pages/Skills'),
  projects: () => import('../pages/Projects'),
  greenway: () => import('../pages/GreenWay'),
  numbers: () => import('../pages/Numbers'),
  ai: () => import('../pages/AskAI'),
}
type DeferredPage = keyof typeof loaders
const pending: Partial<Record<DeferredPage, ReturnType<typeof loaders[DeferredPage]>>> = {}

export function loadPage<P extends DeferredPage>(page: P): ReturnType<typeof loaders[P]> {
  const request = pending[page] ??= loaders[page]().catch(error => {
    delete pending[page]
    throw error
  })
  // Each cache entry comes from the loader with the same page key.
  return request as ReturnType<typeof loaders[P]>
}

// Pointer, keyboard and touch intent start the download during the existing curtain.
export function preloadLinkPage(target: EventTarget | null) {
  if (!(target instanceof Element)) return
  const link = target.closest<HTMLAnchorElement>('a[href]')
  if (!link) return
  const url = new URL(link.href, window.location.href)
  if (url.origin === window.location.origin && isPagePath(url.pathname)) preloadRoutePage(url.pathname + url.search + url.hash)
}

export function preloadRoutePage(href: string) {
  const page = navigationPage(href)
  const module = isProjectCatalogPage(page) ? 'projects' : isMinimalProjectCatalogPage(page) ? 'minimalProjects' : page
  void loadPage(module).catch(() => { /* Navigation shows a retry if the connection fails. */ })
}
