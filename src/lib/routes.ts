export const pagePaths = { home: '/', minimal: '/minimal', skills: '/skills', greenway: '/projects/greenway', numbers: '/numbers', ai: '/ask-ai' } as const
export type Page = keyof typeof pagePaths

export function normalizeRoute(route: string) {
  const url = new URL(route, 'https://portfolio.local/')
  const legacy = url.hash.match(/^#\/(skills|numbers|projects\/greenway|ask-ai)(\/content)?$/)
  if (legacy) {
    url.pathname = `/${legacy[1]}`
    const page = legacy[1] === 'projects/greenway' ? 'greenway' : legacy[1] === 'ask-ai' ? 'ai' : legacy[1]
    url.hash = legacy[2] ? `#${page}-content` : ''
  } else if (url.hash === '#home') {
    url.pathname = '/'
    url.hash = ''
  }
  const path = url.pathname.replace(/\/+$/, '') || '/'
  if (Object.values(pagePaths).some(value => value === path)) url.pathname = path
  return url.pathname + url.search + url.hash
}

export function navigationPage(route: string): Page {
  const path = normalizeRoute(route).split(/[?#]/)[0]
  return (Object.entries(pagePaths).find(([, value]) => value === path)?.[0] as Page | undefined) ?? 'home'
}

export function isPagePath(path: string) {
  const normalized = path.replace(/\/+$/, '') || '/'
  return Object.values(pagePaths).some(value => value === normalized)
}
