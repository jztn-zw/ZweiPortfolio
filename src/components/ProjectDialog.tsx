import { useRef } from 'react'
import { ArrowUpRight, X } from 'lucide-react'
import type { Project } from '../data/portfolio'
import Artwork from './Artwork'
import './ProjectDialog.css'

type ProjectDialogProps = { project: Project; onClose: () => void }

export default function ProjectDialog({ project, onClose }: ProjectDialogProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null)
  return (
    <dialog ref={node => { dialogRef.current = node; if (node && !node.open) node.showModal() }} className="project-dialog" aria-labelledby="project-dialog-title" onClose={onClose} onClick={event => { if (event.target === dialogRef.current) onClose() }}>
      <div className="dialog-content">
        <div className="dialog-header"><span className="eyebrow">PROJECT / {project.id}</span><button type="button" className="close-button" onClick={onClose} aria-label="Close project preview" autoFocus><X size={22} /></button></div>
        <div className={`dialog-art project-${project.artwork}`}><Artwork variant={project.artwork} /></div>
        <p className="eyebrow red">{project.category}</p><h2 id="project-dialog-title">{project.title}</h2><p>{project.description}</p>
        <div className="tech-tags">{project.technologies.map(tech => <span key={tech}>{tech}</span>)}</div>
        {project.liveUrl ? (
          <a className="project-live-link" href={project.liveUrl} target="_blank" rel="noopener noreferrer">Visit Live Site <ArrowUpRight size={17} /><span className="sr-only"> (opens in a new tab)</span></a>
        ) : (
          <div className="placeholder-notice"><ArrowUpRight size={19} /><p>{project.status ?? 'This is a project placeholder.'}<br /><span>Case study and live links will be added here.</span></p></div>
        )}
      </div>
    </dialog>
  )
}
