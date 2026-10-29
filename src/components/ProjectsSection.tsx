import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { projects } from '../data/portfolio'
import type { Project } from '../data/portfolio'
import ProjectCard from './ProjectCard'
import SectionHeading from './SectionHeading'
import useProjectRibbon, { projectRibbonCopies, projectRibbonMiddle } from '../hooks/useProjectRibbon'
import './ProjectsSection.css'

type ProjectsSectionProps = { onSelect: (project: Project) => void }

export default function ProjectsSection({ onSelect }: ProjectsSectionProps) {
  const initialProject = Math.max(0, projects.findIndex(project => project.artwork === 'greenway'))
  const { listRef, activeProject, dragging, isCompact, handlers } = useProjectRibbon(projects.length, initialProject)

  return (
    <section id="projects" className="work-section page-width section-space" aria-labelledby="work-title">
      <div className="section-top projects-section-top">
        <SectionHeading number="01" label="FEATURED WORK">
          <span id="work-title">SELECTED<br className="mobile-break" /> PROJECTS<span className="red">.</span></span>
        </SectionHeading>
        <p className="section-note">Ideas turned into digital experiences.<br /><span className="muted">An evolving collection of my work.</span></p>
      </div>

      <div className="projects-toolbar">
        <span className="eyebrow projects-count"><span className="projects-count-value">{String(projects.length).padStart(2, '0')}</span> PROJECTS / SELECTED COLLECTION</span>
        <span className="more-projects-control">
          <button className="more-projects-button" type="button" aria-disabled="true" aria-label="View more projects" aria-describedby="more-projects-tooltip">
            <span>View More</span>
            <ArrowUpRight size={16} aria-hidden="true" />
          </button>
          <span className="more-projects-tooltip" id="more-projects-tooltip" role="tooltip">Coming soon</span>
        </span>
      </div>

      <p className="sr-only">{projects.length} projects, including {projects.filter(project => !project.status).length} placeholders.</p>
      <div className="project-ribbon-frame">
        <div id="project-list" ref={listRef} className={`project-list project-list--showcase${dragging ? ' project-list--dragging' : ''}`}
          role="region" aria-roledescription={isCompact ? 'carousel' : undefined} aria-label="Selected projects" tabIndex={isCompact ? 0 : undefined} {...handlers}
        >
          {Array.from({ length: projectRibbonCopies }, (_, copy) => projects.map((project, index) => (
            <ProjectCard key={`${copy}-${project.id}`} project={project} view="showcase" onSelect={onSelect}
              ribbonIndex={copy * projects.length + index}
              instance={copy === projectRibbonMiddle ? undefined : `copy-${copy}`}
              isClone={copy !== projectRibbonMiddle} isCentered={index === activeProject}
            />
          )))}
        </div>
      </div>

      <div className="work-caption eyebrow projects-caption">
        <span><span className="red">*</span> THE WORK IS THE STORY.</span>
        <span>{String(projects.filter(project => !project.status).length).padStart(2, '0')} PROJECT PLACEHOLDERS <ArrowDownRight size={15} /></span>
      </div>
    </section>
  )
}
