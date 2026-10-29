import { ArrowUpRight, CodeXml, GraduationCap, PenTool } from 'lucide-react'
import { journey } from '../data/portfolio'
import JourneyGraphic from './JourneyGraphic'
import SectionHeading from './SectionHeading'
import './JourneySection.css'

const entryIcons = { capstone: CodeXml, education: GraduationCap, design: PenTool }

export default function JourneySection() {
  return (
    <section id="journey" className="journey-section" aria-labelledby="journey-title">
      <div className="page-width journey-inner">
        <div className="journey-heading">
          <SectionHeading number="03" label="MY JOURNEY">
            <span id="journey-title">FROM DESIGN<br />TO DEVELOPMENT<span className="red">.</span></span>
          </SectionHeading>
          <div className="journey-introduction">
            <p className="eyebrow">BACKGROUND &amp; EXPERIENCE</p>
            <p>{journey.introduction}</p>
          </div>
        </div>

        <div className="journey-body">
          <aside className="journey-aside" aria-label="Creative foundation">
            <JourneyGraphic />
            <p className="journey-aside-note">From visual ideas to working applications.<br /><span className="muted">The tools change. The curiosity stays.</span></p>
          </aside>

          <ol className="journey-timeline" aria-label="Background and experience, most recent first">
            {journey.entries.map(entry => {
              const Icon = entryIcons[entry.id]
              return (
                <li className={`journey-entry${entry.current ? ' journey-entry--current' : ''}`} key={entry.id}>
                  <div className="journey-entry-date" aria-label={entry.date}>
                    <span className="journey-date-main" aria-hidden="true">{entry.dateMain}</span>
                    <span className="journey-date-detail eyebrow" aria-hidden="true">{entry.dateDetail.replace(/^—\s*/, '')}</span>
                  </div>
                  <div className="journey-entry-copy">
                    <div className="journey-entry-meta">
                      <span className="eyebrow"><span className="journey-status-dot" />{entry.category}</span>
                    </div>
                    <h3>{entry.title}</h3>
                    <p className="journey-entry-context">{entry.context}</p>
                    <p className="journey-entry-description">{entry.description}</p>
                  </div>
                  <Icon className="journey-entry-icon" size={18} strokeWidth={1.5} aria-hidden="true" />
                </li>
              )
            })}
          </ol>
        </div>

        <div className="journey-footer">
          <p className="eyebrow"><span className="red">↗</span> THE JOURNEY CONTINUES.</p>
          <a href="#projects">Explore my work <ArrowUpRight size={17} /></a>
        </div>
      </div>
    </section>
  )
}
