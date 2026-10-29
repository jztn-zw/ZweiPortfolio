import { isPagePath, navigationPage } from './routes'

const loaders = {
  skills: () => import('../pages/Skills'),
  greenway: () => import('../pages/GreenWay'),
  numbers: () => import('../pages/Numbers'),
}
type DeferredPage = keyof typeof loaders
const pending: Partial<Record<DeferredPage, ReturnType<typeof loaders[DeferredPage]>>> = {}

export function loadPage(page: DeferredPage) {
  return pending[page] ??= loaders[page]().catch(error => {
    delete pending[page]
    throw error
  })
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
  if (page !== 'home') void loadPage(page).catch(() => { /* Navigation shows a retry if the connection fails. */ })
}
