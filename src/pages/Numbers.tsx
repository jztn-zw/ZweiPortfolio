import { ArrowDownRight, CodeXml, Eye, Layers, Workflow } from 'lucide-react'
import { useEffect, useState } from 'react'
import SiteHeader from '../components/SiteHeader'
import Footer from '../components/Footer'
import GraphicMark from '../components/GraphicMark'
import GitHubCalendar from '../components/GitHubCalendar'
import NumberMetricArtwork from '../components/NumberMetricArtwork'
import SurfaceSignal from '../components/SurfaceSignal'
import TechnicalNumber from '../components/TechnicalNumber'
import { completedProjects, projectTechnologies, workflowTools } from '../data/numbers'
import { getVisitorCount } from '../lib/visitorCount'
import '../components/GraphicDetails.css'
import './Numbers.css'

function formatCount(value: number) {
  return value.toLocaleString('en-US', value >= 1000
    ? { notation: 'compact', maximumFractionDigits: 1 }
    : { minimumIntegerDigits: 2 })
}

function Count({ value }: { value: number | null }) {
  const [frameValue, setFrameValue] = useState({ target: value, current: value })
  useEffect(() => {
    if (value === null) return
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    const finish = () => {
      cancelAnimationFrame(frame)
      setFrameValue({ target: value, current: value })
    }
    if (motion.matches) return
    const start = performance.now()
    const tick = (now: number) => {
      const progress = Math.min((now - start) / 1000, 1)
      const current = Math.round(value * (1 - Math.pow(1 - progress, 3)))
      setFrameValue(previous => previous.target === value && previous.current === current ? previous : { target: value, current })
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    motion.addEventListener('change', finish)
    return () => { cancelAnimationFrame(frame); motion.removeEventListener('change', finish) }
  }, [value])

  const current = frameValue.target === value ? frameValue.current : value
  return <><TechnicalNumber value={current === null ? '—' : formatCount(current)} /><span className="sr-only">{value === null ? 'Unavailable' : value.toLocaleString('en-US')}</span></>
}

export default function Numbers() {
  const [visitors, setVisitors] = useState<number | null>(null)
  const [visitorUnavailable, setVisitorUnavailable] = useState(import.meta.env.DEV)
  useEffect(() => {
    if (import.meta.env.DEV) return
    let active = true
    getVisitorCount().then(count => { if (active) setVisitors(count) })
      .catch(() => { if (active) setVisitorUnavailable(true) })
    return () => { active = false }
  }, [])

  const metrics = [
    { label: 'Completed projects', value: completedProjects.length, description: 'Ideas taken from concept to a finished application.', compactDescription: 'Finished applications.', category: 'SHIPPED WORK', Icon: Layers },
    { label: 'Technologies used', value: projectTechnologies.length, description: 'Distinct technologies across my completed projects.', compactDescription: 'Across completed work.', category: 'THE BUILDING BLOCKS', Icon: CodeXml },
    { label: 'AI & automation tools', value: workflowTools.length, description: workflowTools.join(' · '), compactDescription: workflowTools.join(' · '), category: 'CONNECTED WORKFLOWS', Icon: Workflow },
    { label: 'Portfolio visitors', value: visitors, description: 'Estimated unique browsers since tracking began.', compactDescription: visitors === null ? null : 'Unique browsers.', category: 'PEOPLE & CONNECTIONS', Icon: Eye },
  ]

  return (
    <div id="/experience/numbers" className="numbers-page">
      <a className="skip-link" href="#numbers-content">Skip to content</a>
      <SiteHeader isHome={false} isNumbers />
      <main id="numbers-content" className="numbers-content" tabIndex={-1}>
        <div className="page-width">
          <section className="numbers-intro" aria-labelledby="numbers-title">
            <div>
              <p className="numbers-eyebrow eyebrow"><span className="red">A SNAPSHOT OF MY WORK</span><GraphicMark variant="signal" /></p>
<h1 id="numbers-title" tabIndex={-1}>THE WORK<br />IN NUMBERS</h1>
            </div>
            <div className="numbers-intro-copy">
              <span className="numbers-coordinate eyebrow" aria-hidden="true">BUILD / EXPLORE / REPEAT</span>
              <p>What I’ve built, the tools behind it, and the people stopping by. A small snapshot that grows with the work.</p>
              <span className="numbers-intro-mark" aria-hidden="true"><span className="numbers-barcode" /><ArrowDownRight size={36} strokeWidth={1} /></span>
            </div>
          </section>

          <section className="numbers-metrics" aria-label="Portfolio statistics">
            {metrics.map(({ label, value, description, compactDescription, category, Icon }, index) => (
              <article key={label} className="numbers-metric" data-hover-surface="metric" aria-label={label}>
                <SurfaceSignal kind="metric" />
                <NumberMetricArtwork index={index} />
                <div className="numbers-metric-top eyebrow"><span>{String(index + 1).padStart(2, '0')} / {category}</span><Icon size={17} strokeWidth={1.4} aria-hidden="true" /></div>
                <div className="numbers-metric-value"><Count value={value} /><span className="numbers-metric-tick" aria-hidden="true" /><span className="numbers-metric-ruler" aria-hidden="true" /></div>
                <h2>{label}</h2>
                <p className="numbers-metric-description">{description}</p>
                {compactDescription && <p className="numbers-metric-compact" aria-hidden="true">{compactDescription}</p>}
                {index === 3 && value === null && <span className="numbers-metric-status eyebrow">{visitorUnavailable ? 'Count unavailable' : 'Loading visitor count…'}</span>}
              </article>
            ))}
          </section>
          <GitHubCalendar />
        </div>
      </main>
      <Footer topHref="/experience/numbers" />
    </div>
  )
}
