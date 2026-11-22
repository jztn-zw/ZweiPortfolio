import { ArrowUpRight, Database, Monitor, Workflow } from 'lucide-react'
import { useState } from 'react'
import { capabilities } from '../data/portfolio'
import CapabilityArtwork from './CapabilityArtwork'
import SectionHeading from './SectionHeading'
import GraphicMark from './GraphicMark'
import CapabilityHoverDetail from './CapabilityHoverDetail'
import './SurfaceSignal.css'
import './CapabilitiesSection.css'

const capabilityIcons = { web: Monitor, fullstack: Database, automation: Workflow }
const artworkLabels = {
  web: ['INTERFACE', 'BUILT FOR EVERY SCREEN'],
  fullstack: ['ARCHITECTURE', 'CONNECTED BY DESIGN'],
  automation: ['WORKFLOW', 'ASSIST. CONNECT. AUTOMATE.'],
}

export default function CapabilitiesSection() {
  const [activeIllustration, setActiveIllustration] = useState<string | null>(null)
  return (
    <section id="capabilities" className="capabilities-section" aria-labelledby="capabilities-title">
      <div className="page-width capabilities-inner">
        <div className="capabilities-heading">
          <SectionHeading number="02" label="WHAT I DO">
<span id="capabilities-title">FROM CONCEPT<br />TO CODE</span>
          </SectionHeading>
          <div className="capabilities-intro">
            <p className="eyebrow">WHAT I CAN BUILD</p>
            <p>Turning ideas into functional digital experiences, from intuitive interfaces to complete applications.</p>
            <a href="/experience/skills" className="capabilities-full-link">View Full Stack &amp; Skills <ArrowUpRight size={16} /></a>
          </div>
        </div>

        <div className="capabilities-list">
          {capabilities.map(capability => {
            const Icon = capabilityIcons[capability.artwork]
            return (
              <article className="capability-row" data-hover-surface="compile" key={capability.id} aria-labelledby={`capability-${capability.id}`}>
                <CapabilityHoverDetail variant={capability.artwork} />
                <div className="capability-backdrop" aria-hidden="true">
                  <CapabilityArtwork variant={capability.artwork} />
                </div>
                <div className="capability-number" aria-hidden="true">
                  <span className="eyebrow">{capability.id}</span>
                  <span className="capability-number-rule" />
                </div>
                <div className="capability-copy">
                  <div className="capability-title-line">
                    <h3 id={`capability-${capability.id}`}>{capability.title}</h3>
                    <Icon size={19} strokeWidth={1.5} aria-hidden="true" />
                  </div>
                  <p>{capability.description}</p>
                  <ul className="capability-tags" aria-label={`${capability.title} technologies`}>
                    {capability.technologies.map(technology => <li key={technology}>{technology}</li>)}
                  </ul>
                </div>
                <button type="button" className="capability-visual"
                  aria-label={`Animate ${capability.title} illustration`}
                  aria-pressed={activeIllustration === capability.id}
                  onClick={() => setActiveIllustration(active => active === capability.id ? null : capability.id)}
                  onKeyDown={event => { if (event.key === 'Escape') setActiveIllustration(null) }}
                >
                  <span className="capability-visual-label eyebrow" aria-hidden="true">{capability.id} / {artworkLabels[capability.artwork][0]}</span>
                  <CapabilityArtwork variant={capability.artwork} />
                  <span className="capability-visual-scan" aria-hidden="true" />
                  <span className="capability-visual-caption eyebrow" aria-hidden="true">{artworkLabels[capability.artwork][1]}<span className="capability-visual-diamonds" /></span>
                </button>
              </article>
            )
          })}
        </div>

        <div className="capabilities-footer">
          <div className="capabilities-footer-copy">
            <GraphicMark variant="registration" />
            <p>Have something in mind?</p>
          </div>
          <a href="#contact" className="capabilities-cta">Let’s talk <ArrowUpRight size={19} /></a>
        </div>
      </div>
    </section>
  )
}
