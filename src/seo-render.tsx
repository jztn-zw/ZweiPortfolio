import { renderToString } from 'react-dom/server'
import Minimal from './pages/Minimal'
import MinimalSkills from './pages/MinimalSkills'
import MinimalProjects from './pages/MinimalProjects'
import MinimalGreenWay from './pages/MinimalGreenWay'
import MinimalVyora from './pages/MinimalVyora'
import Everwell from './pages/Everwell'
import { isMinimalProjectCatalogPage, pagePaths, type Page } from './lib/routes'
export { getSeo, siteUrl } from './lib/seo'
export { pagePaths } from './lib/routes'

export function renderPage(page: Page) {
  const component = page === 'minimal' ? <Minimal />
    : page === 'minimalSkills' ? <MinimalSkills />
    : page === 'minimalGreenway' ? <MinimalGreenWay />
    : page === 'minimalVyora' ? <MinimalVyora />
    : page === 'minimalEverwell' ? <Everwell minimal />
    : isMinimalProjectCatalogPage(page) ? <MinimalProjects page={page} route={pagePaths[page]} /> : null
  return component ? renderToString(component) : ''
}
