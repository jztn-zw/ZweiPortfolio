import { ArrowDown, ArrowLeft, CodeXml, Database, Workflow } from 'lucide-react'
import CapabilityArtwork from '../components/CapabilityArtwork'
import StackIllustration from '../components/StackIllustration'
import SiteHeader from '../components/SiteHeader'
import Footer from '../components/Footer'
import GraphicMark from '../components/GraphicMark'
import { capabilities } from '../data/portfolio'
import { technologyDescriptions } from '../data/skills'
import '../components/GraphicDetails.css'
import './Skills.css'

const icons = { web: CodeXml, fullstack: Database, automation: Workflow }

export default function Skills() {
  const technologyCount = new Set(capabilities.flatMap(capability => [...capability.technologies])).size

  return (
    <div id="/skills" className="skills-page">
      <a className="skip-link" href="#/skills/content">Skip to content</a>
      <SiteHeader isHome={false} />

      <main id="/skills/content" className="skills-content" tabIndex={-1}>
        <div className="page-width">
          <div className="skills-breadcrumb">
            <a href="#capabilities" className="page-back-button"><ArrowLeft size={16} aria-hidden="true" /> Back to Home</a>
            <span className="eyebrow">CAPABILITIES <span className="red">/</span> IN DETAIL</span>
          </div>

          <section className="skills-intro" aria-labelledby="skills-title">
            <div>
              <p className="eyebrow skills-eyebrow"><span className="red">UNDER THE HOOD</span><GraphicMark variant="registration" /></p>
              <h1 id="skills-title" tabIndex={-1}>THE STACK.<br />THE SKILLS<span className="red">.</span></h1>
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
            {capabilities.map(capability => {
              const Icon = icons[capability.artwork]
              return (
                <article className={`skill-discipline skill-discipline--${capability.artwork}`} key={capability.id} aria-labelledby={`skill-${capability.id}`}>
                  <div className="skill-discipline-summary">
                    <div className="skill-discipline-top">
                      <span className="eyebrow"><span className="red">{capability.id}</span> / ARSENAL</span>
                      <span className="skill-discipline-icon" aria-hidden="true"><Icon size={19} strokeWidth={1.5} /></span>
                    </div>
                    <h2 id={`skill-${capability.id}`}>{capability.title}</h2>
                    <p>{capability.description}</p>
                    {capability.artwork === 'automation' && <div className="skill-system-art" aria-hidden="true"><CapabilityArtwork variant="automation" /></div>}
                  </div>

                  <div className="skill-discipline-details">
                    <ul className="skill-technology-list" aria-label={`${capability.title} stack`}>
                      {capability.technologies.map((technology, index) => (
                        <li key={technology}>
                          <span className="skill-technology-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                          <div><h3>{technology}</h3><p>{technologyDescriptions[technology]}</p></div>
                        </li>
                      ))}
                    </ul>
                    <p className="skill-discipline-count eyebrow">{capability.technologies.length} {capability.artwork === 'automation' ? 'WORKFLOW TOOLS' : 'CORE TECHNOLOGIES'} <GraphicMark variant="modules" /></p>
                  </div>
                </article>
              )
            })}
          </section>

        </div>
      </main>
      <Footer topHref="#/skills" />
    </div>
  )
}
