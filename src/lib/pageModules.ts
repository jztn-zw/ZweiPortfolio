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
  const href = target.closest('a')?.getAttribute('href') ?? ''
  preloadHashPage(href)
}

export function preloadHashPage(href: string) {
  const page = href.startsWith('#/skills') ? 'skills' : href.startsWith('#/projects/greenway') ? 'greenway' : href.startsWith('#/numbers') ? 'numbers' : null
  if (page) void loadPage(page).catch(() => { /* Navigation shows a retry if the connection fails. */ })
}
