import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import Footer from '../components/Footer'
import SiteHeader from '../components/SiteHeader'
import TechnologyIcon from '../components/TechnologyIcon'
import { listedProjects } from '../data/portfolio'
import { vyoraCase, vyoraFeatures, vyoraStackLayers } from '../data/vyora'
import './Vyora.css'

export default function Vyora() {
  const project = listedProjects.find(item => item.id === 'vyora')

  return (
    <>
      <a className="skip-link" href="#vyora-content">Skip to content</a>
      <SiteHeader isHome={false} />
      <main className="vyora-case page-width" id="vyora-content" tabIndex={-1}>
        <nav className="vyora-case-nav" aria-label="Project navigation">
          <a className="page-back-button" href="/projects/tools" data-project-back><ArrowLeft size={16} aria-hidden="true" />Back to projects</a>
          {project?.minimalDetailsUrl && <a className="vyora-case-link" href={project.minimalDetailsUrl}>View this project in Minimal</a>}
        </nav>
        {project ? <>
          <header className="vyora-case-hero">
            <div>
              <p className="eyebrow">{vyoraCase.category}</p>
              <h1 id="vyora-title" tabIndex={-1}>{project.title}</h1>
              <p className="vyora-case-tagline">{vyoraCase.tagline.join(' ')}</p>
            </div>
            <div>
              <p>{project.description} {vyoraCase.summary}</p>
              {project.liveUrl && <a className="page-back-button" href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                Visit live website<ArrowUpRight size={16} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span>
              </a>}
            </div>
          </header>

          <dl className="vyora-case-facts">
            {vyoraCase.facts.map(({ label, value }) => <div key={label}><dt className="eyebrow">{label}</dt><dd>{value}</dd></div>)}
            <div><dt className="eyebrow">Status</dt><dd>{project.status}</dd></div>
          </dl>

          <figure className="vyora-case-preview">
            <img src="/images/vyora-studio.jpg" width="1920" height="1032" alt="VYORA Studio photo booth home screen with sample photo strips and frame settings" decoding="async" />
            <figcaption className="eyebrow">Windows app / Studio</figcaption>
          </figure>

          <section className="vyora-case-story" aria-labelledby="vyora-overview">
            <div>
              <h2 id="vyora-overview">Built for the booth</h2>
              {vyoraCase.overview.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
            </div>
            <figure className="vyora-case-preview">
              <img src="/images/vyora-website.jpg" width="1920" height="1080" alt="VYORA website with sample photo strips, the Windows download, and a setup guide" loading="lazy" decoding="async" />
              <figcaption className="eyebrow">Website / Download &amp; setup</figcaption>
            </figure>
          </section>

          <section className="vyora-case-section" aria-labelledby="vyora-features">
            <h2 id="vyora-features">Inside the experience</h2>
            <ul className="vyora-case-features">
              {vyoraFeatures.map(({ title, description, icon: Icon }) => <li key={title}>
                <Icon size={20} aria-hidden="true" /><h3>{title}</h3><p>{description}</p>
              </li>)}
            </ul>
          </section>

          <section className="vyora-case-section" aria-labelledby="vyora-stack">
            <h2 id="vyora-stack" tabIndex={-1}>Built with</h2>
            <div className="vyora-case-stack">
              {vyoraStackLayers.map(layer => <div key={layer.id}>
                <h3>{layer.title}</h3>
                <ul aria-label={`${layer.title} technologies`}>
                  {layer.tools.map(tool => <li key={tool}><TechnologyIcon technology={tool} />{tool}</li>)}
                </ul>
              </div>)}
            </div>
          </section>

          <section className="vyora-case-section vyora-case-progress" aria-labelledby="vyora-status">
            <h2 id="vyora-status">Live, and still growing</h2>
            {vyoraCase.progress.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
          </section>
        </> : <h1 id="vyora-title" tabIndex={-1}>Project unavailable</h1>}
      </main>
      <Footer topHref="/projects/vyora" />
    </>
  )
}
