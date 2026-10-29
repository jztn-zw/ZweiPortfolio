import { ArrowUpRight, CodeXml, Layers, Leaf, Orbit } from 'lucide-react'
import { memo } from 'react'
import type { Project } from '../data/portfolio'
import Artwork from './Artwork'

export type ProjectView = 'showcase' | 'cards'

type ProjectCardProps = {
  project: Project
  view: ProjectView
  onSelect: (project: Project) => void
  ribbonIndex?: number
  instance?: string
  isClone?: boolean
  isCentered?: boolean
}

const projectIcons = { terrain: CodeXml, orbit: Orbit, structure: Layers, greenway: Leaf }
const visibleTechnologyCount = 4
const ProjectArtwork = memo(Artwork)

export default function ProjectCard({ project, view, onSelect, ribbonIndex, instance, isClone = false, isCentered = false }: ProjectCardProps) {
  const Icon = projectIcons[project.artwork]
  const visibleTechnologies = project.technologies.slice(0, visibleTechnologyCount)
  const additionalTechnologyCount = project.technologies.length - visibleTechnologies.length
  const titleId = `project-title-${project.id}${instance ? `-${instance}` : ''}`
  const actionTabIndex = isClone ? -1 : undefined

  return (
    <article className={`project-tile project-tile--${view} project-tile--${project.artwork}${isClone ? ' project-tile--clone' : ''}${isCentered ? ' is-centered' : ''}`} aria-labelledby={titleId} aria-hidden={isClone || undefined} data-ribbon-index={ribbonIndex}>
      {view === 'showcase' && (
        <div className="project-tile-art" aria-hidden="true">
          <ProjectArtwork variant={project.artwork} />
        </div>
      )}
      <div className="project-tile-content">
        <div className="project-tile-top">
          <p className="eyebrow">{project.artwork === 'greenway' ? 'FEATURED PROJECT' : 'PROJECT'}</p>
          <span className="project-tile-icon" aria-hidden="true"><Icon size={17} strokeWidth={1.5} /></span>
        </div>
        <div className="project-tile-copy">
          <p className="tile-category eyebrow">{project.category}</p>
          <h3 id={titleId}>{project.title}</h3>
          <div className="tile-details">
            <p className="tile-description">{project.description}</p>
            <div className="tile-technologies">
              {visibleTechnologies.map(tech => <span key={tech}>{tech}</span>)}
              {additionalTechnologyCount > 0 && (project.detailsUrl ? (
                <a className="tile-technologies-more" href={project.detailsUrl} tabIndex={actionTabIndex} aria-label={`View all technologies for ${project.title}`}>+{additionalTechnologyCount}</a>
              ) : (
                <button
                  type="button"
                  tabIndex={actionTabIndex}
                  className="tile-technologies-more"
                  onClick={() => onSelect(project)}
                  aria-label={`View ${additionalTechnologyCount} more technologies for ${project.title}`}
                  aria-haspopup="dialog"
                >
                  +{additionalTechnologyCount}
                </button>
              ))}
            </div>
          </div>
          <div className="project-tile-bottom">
            <span className="eyebrow tile-status">{project.status ?? 'PLACEHOLDER'}</span>
            {project.detailsUrl ? (
              <a href={project.detailsUrl} tabIndex={actionTabIndex} aria-label={`View ${project.title} project details`}>
                View Project <ArrowUpRight size={16} />
              </a>
            ) : project.liveUrl ? (
              <a href={project.liveUrl} tabIndex={actionTabIndex} target="_blank" rel="noopener noreferrer" aria-label={`View ${project.title} live website (opens in a new tab)`}>
                View Project <ArrowUpRight size={16} />
              </a>
            ) : (
              <button type="button" tabIndex={actionTabIndex} onClick={() => onSelect(project)} aria-label={`View project ${project.id}`}>
                View Project <ArrowUpRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
