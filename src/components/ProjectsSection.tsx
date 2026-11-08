import { ArrowUpRight } from 'lucide-react'
import { projectCollections } from '../data/projectCollections'
import ProjectCategoryCard from './ProjectCategoryCard'
import SectionHeading from './SectionHeading'
import useProjectRibbon, { projectRibbonCopies, projectRibbonMiddle } from '../hooks/useProjectRibbon'
import './ProjectsSection.css'
import './ProjectCollections.css'

const compactCopies = Array.from({ length: projectRibbonCopies }, (_, index) => index)
const desktopCopies = [projectRibbonMiddle]

export default function ProjectsSection() {
  const initialCollection = projectCollections.findIndex(collection => collection.id === 'web-mobile')
  const { listRef, activeProject, dragging, isCompact, handlers } = useProjectRibbon(projectCollections.length, initialCollection)

  return (
    <section id="projects" className="work-section page-width section-space" aria-labelledby="work-title">
      <div className="section-top projects-section-top">
        <SectionHeading number="01" label="PROJECT COLLECTIONS">
<span id="work-title">PROJECTS</span>
        </SectionHeading>
        <p className="section-note">Web and mobile apps, connected workflows,<br className="mobile-break" /> and tools I’m experimenting with.</p>
      </div>

      <div className="projects-toolbar">
        <span className="eyebrow projects-count"><span className="projects-count-value">{String(projectCollections.length).padStart(2, '0')}</span> COLLECTIONS</span>
        <a className="page-back-button more-projects-button" href="/projects">View all projects <ArrowUpRight size={16} aria-hidden="true" /></a>
      </div>

      <div className="project-ribbon-frame">
        <div id="project-list" ref={listRef} className={`project-list project-list--showcase${dragging ? ' project-list--dragging' : ''}`}
          role="region" aria-roledescription={isCompact ? 'carousel' : undefined} aria-label="Project collections" tabIndex={isCompact ? 0 : undefined} {...handlers}
        >
          {(isCompact ? compactCopies : desktopCopies).map(copy => projectCollections.map((collection, index) => (
            <ProjectCategoryCard key={`${copy}-${collection.id}`} collection={collection}
              ribbonIndex={copy * projectCollections.length + index}
              isClone={copy !== projectRibbonMiddle} isCentered={index === activeProject}
            />
          )))}
        </div>
      </div>

    </section>
  )
}
