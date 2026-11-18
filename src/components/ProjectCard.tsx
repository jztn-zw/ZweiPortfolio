import { ArrowUpRight, Camera, CodeXml, Layers, Leaf, Orbit } from 'lucide-react'
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
const catalogPreviews: Record<string, { src: string; alt: string; width: number; height: number }> = {
  '002': {
    src: '/images/greenway-showcase-poster.jpg',
    alt: 'GreenWay mobile app showing collection schedules, truck tracking, and resident reports',
    width: 1920,
    height: 1080,
  },
  vyora: {
    src: '/images/vyora-studio.jpg',
    alt: 'VYORA Studio photo booth home screen with sample photo strips and frame settings',
    width: 1920,
    height: 1032,
  },
}

export default function ProjectCard({ project, view, onSelect, ribbonIndex, instance, isClone = false, isCentered = false }: ProjectCardProps) {
  const Icon = project.id === 'vyora' ? Camera : projectIcons[project.artwork]
  const preview = catalogPreviews[project.id]
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
          {view === 'cards' && preview && (
            <img
              className="catalog-project-preview"
              {...preview}
              loading="lazy"
              decoding="async"
            />
          )}
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
            {project.status && <span className="eyebrow tile-status">{project.status}</span>}
            {project.detailsUrl ? (
              <div className="tile-project-links">
                {view === 'cards' && project.liveUrl && (
                  <a className="tile-project-secondary" href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                    Live site <ArrowUpRight size={14} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span>
                  </a>
                )}
                <a className="tile-project-primary" href={project.detailsUrl} tabIndex={actionTabIndex} aria-label={`View ${project.title} project details`}>
                  View Project <ArrowUpRight size={16} aria-hidden="true" />
                </a>
              </div>
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
