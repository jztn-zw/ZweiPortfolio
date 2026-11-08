import type { ProjectCollection } from '../data/portfolio'

const projectCollectionPaths = {
  'web-mobile': '/projects/web-mobile',
  automation: '/projects/automation',
  tools: '/projects/tools',
} as const satisfies Record<ProjectCollection, string>

export const pagePaths = {
  home: '/',
  minimal: '/minimal',
  minimalSkills: '/minimal/skills',
  minimalProjects: '/minimal/projects',
  minimalWebMobileProjects: '/minimal/projects/web-mobile',
  minimalAutomationProjects: '/minimal/projects/automation',
  minimalToolsProjects: '/minimal/projects/tools',
  minimalGreenway: '/minimal/projects/greenway',
  minimalVyora: '/minimal/projects/vyora',
  skills: '/skills',
  projects: '/projects',
  webMobileProjects: projectCollectionPaths['web-mobile'],
  automationProjects: projectCollectionPaths.automation,
  toolsProjects: projectCollectionPaths.tools,
  greenway: '/projects/greenway',
  numbers: '/numbers',
  ai: '/ask-ai',
} as const
export type Page = keyof typeof pagePaths

export const projectCollectionByPage = {
  webMobileProjects: 'web-mobile',
  automationProjects: 'automation',
  toolsProjects: 'tools',
} as const satisfies Partial<Record<Page, ProjectCollection>>

export type ProjectCatalogPage = 'projects' | keyof typeof projectCollectionByPage

export function isProjectCatalogPage(page: Page): page is ProjectCatalogPage {
  return page === 'projects' || Object.hasOwn(projectCollectionByPage, page)
}

export function projectCollectionHref(collection?: ProjectCollection) {
  return collection ? projectCollectionPaths[collection] : pagePaths.projects
}

export const minimalProjectCollectionByPage = {
  minimalWebMobileProjects: 'web-mobile',
  minimalAutomationProjects: 'automation',
  minimalToolsProjects: 'tools',
} as const satisfies Partial<Record<Page, ProjectCollection>>

export type MinimalProjectCatalogPage = 'minimalProjects' | keyof typeof minimalProjectCollectionByPage

export function isMinimalProjectCatalogPage(page: Page): page is MinimalProjectCatalogPage {
  return page === 'minimalProjects' || Object.hasOwn(minimalProjectCollectionByPage, page)
}

export function minimalProjectCollectionHref(collection?: ProjectCollection) {
  return collection ? `/minimal${projectCollectionPaths[collection]}` : pagePaths.minimalProjects
}

export function isMinimalPage(page: string) {
  return page === 'minimal' || page === 'minimalSkills' || page === 'minimalProjects' || page === 'minimalGreenway' || page === 'minimalVyora' || Object.hasOwn(minimalProjectCollectionByPage, page)
}

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
  if (path === pagePaths.projects) {
    const category = url.searchParams.get('category')
    if (category && Object.hasOwn(projectCollectionPaths, category)) {
      url.pathname = projectCollectionHref(category as ProjectCollection)
      url.searchParams.delete('category')
      if (url.hash === '#project-filters') url.hash = ''
    }
  }
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
