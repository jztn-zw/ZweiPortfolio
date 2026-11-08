import { ArrowRight, ArrowUpRight } from 'lucide-react'
import type { Project } from '../data/portfolio'
import '../pages/MinimalProjects.css'

export default function MinimalProjectCard({ project }: { project: Project }) {
  const detailsHref = project.minimalDetailsUrl ?? (project.artwork === 'greenway' ? '/minimal/projects/greenway' : project.detailsUrl)

  return (
    <article className="min-card min-project-card">
      <header>
        <h3>{project.title}</h3>
        <div className="min-project-card-meta">
          <p>{project.category}</p>
          {project.status && <span>{project.status}</span>}
        </div>
      </header>
      <p className="min-project-card-description">{project.description}</p>
      {project.technologies.length > 0 && (
        <ul className="min-tags" aria-label={`${project.title} technologies`}>
          {project.technologies.slice(0, 4).map(technology => <li key={technology}>{technology}</li>)}
        </ul>
      )}
      {(detailsHref || project.liveUrl) && (
        <div className="min-project-card-links">
          {detailsHref && <a className="min-text-link min-project-card-primary" href={detailsHref} aria-label={`View ${project.title} project`}>View project<ArrowRight size={14} aria-hidden="true" /></a>}
          {project.liveUrl && (
            <a className={`min-text-link ${detailsHref ? 'min-project-card-secondary' : 'min-project-card-primary'}`} href={project.liveUrl} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${project.title} website (opens in a new tab)`}>
              Live website<ArrowUpRight size={13} aria-hidden="true" />
            </a>
          )}
        </div>
      )}
    </article>
  )
}
