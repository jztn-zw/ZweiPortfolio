import { ArrowDown, ArrowLeft, CodeXml, Database, Workflow } from 'lucide-react'
import { useState } from 'react'
import StackIllustration from '../components/StackIllustration'
import SiteHeader from '../components/SiteHeader'
import Footer from '../components/Footer'
import GraphicMark from '../components/GraphicMark'
import { capabilities } from '../data/portfolio'
import { technologyDescriptions } from '../data/skills'
import '../components/GraphicDetails.css'
import './Skills.css'

const icons = { web: CodeXml, fullstack: Database, automation: Workflow }
const categoryLabels = { web: 'INTERFACE', fullstack: 'SYSTEMS', automation: 'WORKFLOW' }

function SkillDiscipline({ capability }: { capability: (typeof capabilities)[number] }) {
  const [activeTechnology, setActiveTechnology] = useState<string | null>(null)
  const Icon = icons[capability.artwork]
  const insightId = `skill-insight-${capability.id}`

  return (
    <article className={`skill-discipline skill-discipline--${capability.artwork}`} aria-labelledby={`skill-${capability.id}`}>
      <div className="skill-discipline-summary">
        <div className="skill-discipline-top">
          <span className="eyebrow"><span className="red">{capability.id}</span> / {categoryLabels[capability.artwork]}</span>
          <span className="skill-discipline-icon" aria-hidden="true"><Icon size={18} strokeWidth={1.5} /></span>
        </div>
        <h2 id={`skill-${capability.id}`}>{capability.title}</h2>
        <p>{capability.description}</p>
      </div>

      <div className="skill-discipline-details">
        <ul className="skill-tag-list" aria-label={`${capability.title} stack`}>
          {capability.technologies.map((technology, index) => {
            const descriptionId = `skill-description-${capability.id}-${index}`
            return <li key={technology}>
              <button type="button" className="skill-technology-tag"
                aria-expanded={activeTechnology === technology}
                aria-controls={insightId}
                aria-describedby={descriptionId}
                onPointerEnter={event => { if (event.pointerType !== 'touch') setActiveTechnology(technology) }}
                onPointerLeave={event => { if (event.pointerType !== 'touch') setActiveTechnology(null) }}
                onFocus={() => setActiveTechnology(technology)}
                onBlur={() => setActiveTechnology(null)}
                onClick={() => setActiveTechnology(technology)}
                onKeyDown={event => { if (event.key === 'Escape') setActiveTechnology(null) }}
              >
                <span className="skill-tag-node" aria-hidden="true" /><span>{technology}</span>
              </button>
              <span id={descriptionId} className="sr-only">{technologyDescriptions[technology]}</span>
            </li>
          })}
        </ul>
        <div className="skill-tech-insight" id={insightId} data-active={activeTechnology !== null}>
          {activeTechnology ? <p className="skill-tech-explanation" key={activeTechnology}>
            <span className="skill-insight-mark" />
            <span><strong>{activeTechnology}</strong><span>{technologyDescriptions[activeTechnology]}</span></span>
          </p> : <p className="skill-discipline-count eyebrow">{String(capability.technologies.length).padStart(2, '0')} {capability.artwork === 'automation' ? 'WORKFLOW TOOLS' : 'TECHNOLOGIES'}<GraphicMark variant="modules" /></p>}
        </div>
      </div>
    </article>
  )
}

export default function Skills() {
  const technologyCount = new Set(capabilities.flatMap(capability => [...capability.technologies])).size

  return (
    <div id="/skills" className="skills-page">
      <a className="skip-link" href="#skills-content">Skip to content</a>
      <SiteHeader isHome={false} />

      <main id="skills-content" className="skills-content" tabIndex={-1}>
        <div className="page-width">
          <div className="skills-breadcrumb">
            <a href="/experience#capabilities" className="page-back-button"><ArrowLeft size={16} aria-hidden="true" /> Back to Home</a>
            <span className="eyebrow">CAPABILITIES <span className="red">/</span> IN DETAIL</span>
          </div>

          <section className="skills-intro" aria-labelledby="skills-title">
            <div>
              <p className="eyebrow skills-eyebrow"><span className="red">UNDER THE HOOD</span><GraphicMark variant="registration" /></p>
<h1 id="skills-title" tabIndex={-1}>THE STACK<br />THE SKILLS</h1>
              <p className="skills-intro-description">The technologies behind my interfaces and systems, plus the AI tools I use for coding and workflow automation.</p>
            </div>
            <aside className="skills-overview" aria-label="Stack overview">
              <div className="skills-overview-art"><StackIllustration /></div>
              <div className="skills-overview-counts">
                <div><strong>{String(technologyCount).padStart(2, '0')}</strong><span className="eyebrow">TOOLS &amp; TECHNOLOGIES</span></div>
                <div><strong>{String(capabilities.length).padStart(2, '0')}</strong><span className="eyebrow">DISCIPLINES</span></div>
              </div>
            </aside>
          </section>

          <div className="skills-section-divider">
            <p className="eyebrow">01 <span className="label-slash">/</span>TECHNICAL ARSENAL</p>
            <span className="eyebrow">INTERFACES / SYSTEMS / AUTOMATION <ArrowDown size={13} /></span>
          </div>

          <section className="skills-grid" aria-label="Technical skills by discipline">
            {capabilities.map(capability => <SkillDiscipline key={capability.id} capability={capability} />)}
          </section>

        </div>
      </main>
      <Footer topHref="/skills" />
    </div>
  )
}
