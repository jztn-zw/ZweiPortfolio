import { portfolio, projects } from '../data/portfolio'
import { pagePaths, type Page } from './routes'

export const siteUrl = 'https://jaztincontreras.vercel.app'
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

export function getSeo(page: Page) {
  const canonicalPage = canonicalPages[page] ?? page
  const project = projects.find(item => item.minimalDetailsUrl === pagePaths[canonicalPage])
  const [title, description] = project
    ? [`${project.title} | ${portfolio.name}`, project.description]
    : details[canonicalPage] ?? details.minimal
  const path = canonicalPage === 'minimal' ? '/' : pagePaths[canonicalPage]
  const url = siteUrl + path
  const personId = `${siteUrl}/#person`
  const person = {
    '@type': 'Person', '@id': personId, name: portfolio.name,
    alternateName: ['Jaztin Contreras', 'Jaztin Abram A. Contreras'],
    url: `${siteUrl}/`, jobTitle: portfolio.role,
    address: { '@type': 'PostalAddress', addressRegion: 'Quezon', addressCountry: 'PH' },
    sameAs: portfolio.contacts.filter(contact => contact.id !== 'email' && contact.url).map(contact => contact.url),
    knowsAbout: ['React', 'TypeScript', 'Node.js', 'Web Development', 'React Native', 'Electron', 'WordPress', 'Workflow Automation'],
  }
  return {
    title, description, url, canonicalPage, image: `${siteUrl}/images/jaztin-portrait.webp`,
    structuredData: {
      '@context': 'https://schema.org',
      '@graph': [person,
        { '@type': 'WebSite', '@id': `${siteUrl}/#website`, url: `${siteUrl}/`, name: `${portfolio.name} — Developer Portfolio`, publisher: { '@id': personId } },
        { '@type': canonicalPage === 'minimal' ? 'ProfilePage' : 'WebPage', '@id': `${url}#page`, url, name: title, description,
          isPartOf: { '@id': `${siteUrl}/#website` }, mainEntity: { '@id': project ? `${url}#project` : personId } },
        ...(project ? [{ '@type': 'CreativeWork', '@id': `${url}#project`, name: project.title, description: project.description, creator: { '@id': personId }, keywords: project.technologies.join(', '), url }] : []),
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
  for (const [key, value] of Object.entries({ title: seo.title, description: seo.description, url: seo.url, image: seo.image, type: 'website', site_name: `${portfolio.name} Portfolio` })) setMeta(`og:${key}`, value, true)
  for (const [key, value] of Object.entries({ card: 'summary_large_image', title: seo.title, description: seo.description, image: seo.image })) setMeta(`twitter:${key}`, value)
  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical) }
  canonical.href = seo.url
  let schema = document.getElementById('portfolio-schema')
  if (!schema) { schema = document.createElement('script'); schema.id = 'portfolio-schema'; schema.setAttribute('type', 'application/ld+json'); document.head.appendChild(schema) }
  schema.textContent = JSON.stringify(seo.structuredData).replace(/</g, '\\u003c')
}
