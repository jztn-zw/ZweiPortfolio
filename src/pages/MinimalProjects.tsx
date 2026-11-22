import MinimalLayout from '../components/MinimalLayout'
import MinimalProjectCard from '../components/MinimalProjectCard'
import { listedProjects } from '../data/portfolio'
import { projectCollections } from '../data/projectCollections'
import { minimalProjectCollectionByPage, minimalProjectCollectionHref, projectCollectionHref, type MinimalProjectCatalogPage } from '../lib/routes'
import './MinimalDetails.css'

export default function MinimalProjects({ page = 'minimalProjects', route = '/projects' }: { page?: MinimalProjectCatalogPage; route?: string }) {
  const collectionId = page === 'minimalProjects' ? undefined : minimalProjectCollectionByPage[page]
  const collection = projectCollections.find(item => item.id === collectionId)
  const filterId = new URL(route, 'https://portfolio.local/').searchParams.get('filter')
  const activeCollection = collection ?? projectCollections.find(item => item.id === filterId)
  const visibleProjects = activeCollection ? listedProjects.filter(project => project.collection === activeCollection.id) : listedProjects

  return (
    <MinimalLayout contentId={`${page}-content`} fullHref={projectCollectionHref(collectionId)}>
      <header className="min-detail-intro">
        <p className="min-kicker">The collection</p>
        <h1 id={`${page}-title`} tabIndex={-1}>{collection?.title ?? 'All projects'}</h1>
        <p>{collection?.description ?? 'Applications and tools I’ve built across web, mobile, automation, and experiments.'}</p>
      </header>
      {!collection && (
        <nav className="min-project-filters" id="min-project-filters" aria-label="Project collections" tabIndex={-1}>
          <a href={`${minimalProjectCollectionHref()}#min-project-filters`} aria-current={!activeCollection ? 'page' : undefined}>All projects</a>
          {projectCollections.map(item => (
            <a key={item.id} href={`${minimalProjectCollectionHref()}?filter=${item.id}#min-project-filters`} aria-current={item.id === activeCollection?.id ? 'page' : undefined}>{item.title}</a>
          ))}
        </nav>
      )}
      <div className="min-project-grid">
        {visibleProjects.map(project => <MinimalProjectCard key={project.id} project={project} />)}
      </div>
      {visibleProjects.length === 0 && (
        <section className="min-card min-project-empty-panel" aria-labelledby="min-project-empty-title">
          <h2 id="min-project-empty-title">Projects coming soon</h2>
          <p>New work will appear here as it’s ready to share.</p>
        </section>
      )}
    </MinimalLayout>
  )
}
