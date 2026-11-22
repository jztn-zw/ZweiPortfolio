import { useState } from 'react'
import { ArrowLeft, Layers3 } from 'lucide-react'
import Footer from '../components/Footer'
import ProjectCard from '../components/ProjectCard'
import ProjectDialog from '../components/ProjectDialog'
import { SectionLabel } from '../components/SectionHeading'
import SiteHeader from '../components/SiteHeader'
import { listedProjects, type Project, type ProjectCollection } from '../data/portfolio'
import { projectCollections } from '../data/projectCollections'
import { projectCollectionByPage, projectCollectionHref, type ProjectCatalogPage } from '../lib/routes'
import '../components/ProjectsSection.css'
import './Projects.css'

const filters = [
  { id: undefined, title: 'All Projects' },
  projectCollections[1],
  projectCollections[0],
  projectCollections[2],
]

function filterHref(collection?: ProjectCollection) {
  return collection ? `/experience/projects?filter=${collection}` : '/experience/projects'
}

export default function Projects({ page, route }: { page: ProjectCatalogPage; route: string }) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const isAll = page === 'projects'
  const collectionId = isAll ? undefined : projectCollectionByPage[page]
  const collection = projectCollections.find(item => item.id === collectionId)
  const filterId = isAll ? new URL(route, 'https://portfolio.local').searchParams.get('filter') : null
  const activeFilter = projectCollections.find(item => item.id === filterId)
  const visibleCollection = collection ?? activeFilter
  const visibleProjects = visibleCollection
    ? listedProjects.filter(project => project.collection === visibleCollection.id)
    : listedProjects

  return (
    <>
      <a className="skip-link" href="#projects-content">Skip to content</a>
      <SiteHeader isHome={false} />
      <main className="project-catalog page-width" id="projects-content" tabIndex={-1}>
        <a className="page-back-button" href="/experience#projects"><ArrowLeft size={16} aria-hidden="true" />Back to home</a>
        <header className="project-catalog-heading">
          <SectionLabel number={collection?.index ?? '01'} label={isAll ? 'PROJECT COLLECTIONS' : 'PROJECT COLLECTION'} />
<h1 id={`${page}-title`} tabIndex={-1}>{collection?.title ?? 'All Projects'}</h1>
          <p>{collection?.description ?? 'Browse all my published work in web and mobile development, automation, and experiments.'}</p>
        </header>
        {isAll && (
          <nav className="project-catalog-filters" id="project-filters" aria-label="Filter projects by collection" tabIndex={-1}>
            {filters.map(filter => (
              <a key={filter.title} href={`${filterHref(filter.id)}#project-filters`}
                aria-current={filter.id === activeFilter?.id ? 'true' : undefined}>{filter.title}</a>
            ))}
          </nav>
        )}
        <section className="project-catalog-results" aria-labelledby="project-results-title">
          <div className="project-results-heading">
            <h2 id="project-results-title">{activeFilter?.title ?? 'Published work'}</h2>
            <span className="eyebrow">{visibleProjects.length} {visibleProjects.length === 1 ? 'PROJECT' : 'PROJECTS'}</span>
          </div>
          {visibleProjects.length > 0 ? (
            <div className="project-list project-list--cards">
              {visibleProjects.map(project => <ProjectCard key={project.id} project={project} view="cards" onSelect={setSelectedProject} />)}
            </div>
          ) : (
            <div className="project-catalog-empty">
              <span className="project-catalog-empty-icon"><Layers3 size={21} strokeWidth={1.5} aria-hidden="true" /></span>
              <div><h3>Projects coming soon.</h3><p>I’ll add {visibleCollection ? 'work to this collection' : 'new work here'} as it’s ready to share.</p></div>
            </div>
          )}
        </section>
      </main>
      <Footer topHref={isAll ? filterHref(activeFilter?.id) : projectCollectionHref(collectionId)} />
      {selectedProject && <ProjectDialog project={selectedProject} onClose={() => setSelectedProject(null)} />}
    </>
  )
}
