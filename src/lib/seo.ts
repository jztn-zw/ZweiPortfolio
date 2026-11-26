import { listedProjects, portfolio, projects } from '../data/portfolio'
import { projectCollections } from '../data/projectCollections'
import { pagePaths, type Page } from './routes'

export const siteUrl = 'https://jaztincontreras.vercel.app'
const siteName = 'Jaztin Abram Contreras'
const homeDescription = 'Jaztin Abram Contreras is a full-stack developer in Quezon, Philippines, building React websites, mobile apps, Windows software, and workflow automation.'
const canonicalPages: Partial<Record<Page, Page>> = {
  home: 'minimal', skills: 'minimalSkills', projects: 'minimalProjects',
  webMobileProjects: 'minimalWebMobileProjects', automationProjects: 'minimalAutomationProjects', toolsProjects: 'minimalToolsProjects',
  greenway: 'minimalGreenway', vyora: 'minimalVyora', everwell: 'minimalEverwell',
}
const details: Record<string, [string, string]> = {
  minimal: ['Jaztin Abram Contreras | Full-Stack Developer, Philippines', homeDescription],
  minimalSkills: ['Skills & Tech Stack | Jaztin Abram Contreras', 'Explore Jaztin’s React, TypeScript, Node.js, React Native, Electron, WordPress, database, and workflow automation skills.'],
  minimalProjects: ['Development Projects | Jaztin Abram Contreras', 'Explore GreenWay, VYORA, and Everwell: web and mobile applications, Windows software, and WordPress with GoHighLevel inquiry automation.'],
  minimalWebMobileProjects: ['Web & Mobile Projects | Jaztin Abram Contreras', 'Explore Jaztin’s web and mobile development work, including GreenWay, a waste management platform with collection tracking and resident reports.'],
  minimalAutomationProjects: ['WordPress & Automation Projects | Jaztin Abram Contreras', 'Explore Everwell, a WordPress clinic demo with a GoHighLevel inquiry form and draft workflow for team alerts and confirmation emails.'],
  minimalToolsProjects: ['Desktop Software & Tools | Jaztin Abram Contreras', 'Explore VYORA, an offline Windows photo booth built with Electron, React, TypeScript, and SQLite for capturing and printing custom photo strips.'],
  ai: ['Ask Jaztin About His Work | Jaztin Abram Contreras', 'Ask about Jaztin’s development projects, technical skills, background, and opportunities to work together.'],
  numbers: ['Interactive Experiments | Jaztin Abram Contreras', 'Explore interactive number experiments in Jaztin Abram Contreras’s developer portfolio.'],
}
const projectSearchTitles: Record<string, string> = {
  everwell: 'Everwell: WordPress & GoHighLevel Automation',
  '002': 'GreenWay: Web & Mobile Waste Management App',
  vyora: 'VYORA: Windows Photo Booth Software',
}
const collectionPages = {
  minimalWebMobileProjects: 'web-mobile',
  minimalAutomationProjects: 'automation',
  minimalToolsProjects: 'tools',
} as const

export function getSeo(page: Page) {
  const canonicalPage = canonicalPages[page] ?? page
  const project = projects.find(item => item.minimalDetailsUrl === pagePaths[canonicalPage])
  const [title, description] = project
    ? [`${projectSearchTitles[project.id] ?? project.title} | ${portfolio.name}`, project.description]
    : details[canonicalPage] ?? details.minimal
  const path = canonicalPage === 'minimal' ? '/' : pagePaths[canonicalPage]
  const url = siteUrl + path
  const personId = `${siteUrl}/#person`
  const projectImages: Record<string, string> = { '002': '/images/greenway-web.webp', vyora: '/images/vyora-website.jpg', everwell: '/images/everwell/website.jpg' }
  const image = siteUrl + (project && projectImages[project.id] ? projectImages[project.id] : '/images/jaztin-portrait.webp')
  const workSamples = (canonicalPage === 'minimal' ? listedProjects : project ? [project] : []).filter(item => item.minimalDetailsUrl)
  const collectionId = collectionPages[canonicalPage as keyof typeof collectionPages]
  const collection = projectCollections.find(item => item.id === collectionId)
  const catalog = canonicalPage === 'minimalProjects' || Boolean(collection)
  const catalogProjects = listedProjects.filter(item => item.minimalDetailsUrl && (!collectionId || item.collection === collectionId))
  const crumbs = [{ name: portfolio.name, url: `${siteUrl}/` }]
  if (canonicalPage !== 'minimal') {
    if (project || collection) crumbs.push({ name: 'Projects', url: `${siteUrl}/projects` })
    crumbs.push({ name: project?.title ?? collection?.title ?? (canonicalPage === 'minimalSkills' ? 'Skills & Tech Stack' : title.split(' | ')[0]), url })
  }
  const person = {
    '@type': 'Person', '@id': personId, name: portfolio.name,
    alternateName: ['Jaztin Contreras', 'Jaztin Abram A. Contreras'],
    url: `${siteUrl}/`, jobTitle: portfolio.role,
    description: homeDescription,
    image: `${siteUrl}/images/jaztin-portrait.webp`,
    mainEntityOfPage: { '@id': `${siteUrl}/#page` },
    address: { '@type': 'PostalAddress', addressRegion: 'Quezon', addressCountry: 'PH' },
    sameAs: portfolio.contacts.filter(contact => contact.id !== 'email' && contact.url).map(contact => contact.url),
    affiliation: { '@type': 'EducationalOrganization', name: 'Manuel S. Enverga University Foundation – Candelaria, Inc.' },
    knowsAbout: ['React', 'TypeScript', 'Node.js', 'Web Development', 'React Native', 'Electron', 'WordPress', 'Workflow Automation'],
  }
  return {
    title, description, url, canonicalPage, siteName, image,
    structuredData: {
      '@context': 'https://schema.org',
      '@graph': [person,
        { '@type': 'WebSite', '@id': `${siteUrl}/#website`, url: `${siteUrl}/`, name: siteName, alternateName: ['Jaztin Contreras', 'Jaztin Abram Contreras Portfolio'], description: homeDescription, publisher: { '@id': personId }, inLanguage: 'en' },
        { '@type': canonicalPage === 'minimal' ? 'ProfilePage' : catalog ? 'CollectionPage' : 'WebPage', '@id': `${url}#page`, url, name: title, description,
          isPartOf: { '@id': `${siteUrl}/#website` }, author: { '@id': personId }, about: { '@id': personId }, mainEntity: { '@id': project ? `${url}#project` : catalog ? `${url}#projects` : personId },
          ...(canonicalPage === 'minimal' ? { mentions: workSamples.map(item => ({ '@id': `${siteUrl}${item.minimalDetailsUrl}#project` })) } : {}) },
        ...workSamples.map(item => ({ '@type': 'CreativeWork', '@id': `${siteUrl}${item.minimalDetailsUrl}#project`, name: item.title, description: item.description, creator: { '@id': personId }, keywords: item.technologies.join(', '), url: siteUrl + item.minimalDetailsUrl, ...(item.liveUrl ? { sameAs: item.liveUrl } : {}), ...(projectImages[item.id] ? { image: siteUrl + projectImages[item.id] } : {}) })),
        ...(catalog ? [{ '@type': 'ItemList', '@id': `${url}#projects`, numberOfItems: catalogProjects.length, itemListElement: catalogProjects.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.title, url: siteUrl + item.minimalDetailsUrl })) }] : []),
        ...(crumbs.length > 1 ? [{ '@type': 'BreadcrumbList', '@id': `${url}#breadcrumbs`, itemListElement: crumbs.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.name, item: item.url })) }] : []),
      ],
    },
  }
}

export function applySeo(page: Page) {
  const seo = getSeo(page)
  document.title = seo.title
  const setMeta = (key: string, value: string, property = false) => {
    const attribute = property ? 'property' : 'name'
    let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
    if (!element) { element = document.createElement('meta'); element.setAttribute(attribute, key); document.head.appendChild(element) }
    element.content = value
  }
  setMeta('description', seo.description)
  setMeta('robots', 'index, follow, max-image-preview:large')
  for (const [key, value] of Object.entries({ title: seo.title, description: seo.description, url: seo.url, image: seo.image, type: 'website', site_name: seo.siteName })) setMeta(`og:${key}`, value, true)
  for (const [key, value] of Object.entries({ card: 'summary_large_image', title: seo.title, description: seo.description, image: seo.image })) setMeta(`twitter:${key}`, value)
  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical) }
  canonical.href = seo.url
  let schema = document.getElementById('portfolio-schema')
  if (!schema) { schema = document.createElement('script'); schema.id = 'portfolio-schema'; schema.setAttribute('type', 'application/ld+json'); document.head.appendChild(schema) }
  schema.textContent = JSON.stringify(seo.structuredData).replace(/</g, '\\u003c')
}
