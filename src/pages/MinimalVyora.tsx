import { ArrowRight, ArrowUpRight, Hammer } from 'lucide-react'
import MinimalLayout from '../components/MinimalLayout'
import { portfolio, projects } from '../data/portfolio'
import { vyoraCase, vyoraFeatures, vyoraStackLayers } from '../data/vyora'
import './MinimalGreenWay.css'
import './MinimalVyora.css'

export default function MinimalVyora() {
  const project = projects.find(project => project.id === 'vyora')
  const email = portfolio.contacts.find(contact => contact.id === 'email')?.url

  if (!project) {
    return <MinimalLayout contentId="minimalVyora-content">
      <h1 id="minimalVyora-title" tabIndex={-1}>Project unavailable</h1>
      <a className="min-text-link" href="/projects/tools">Browse projects<ArrowRight size={14} aria-hidden="true" /></a>
    </MinimalLayout>
  }

  return (
    <MinimalLayout contentId="minimalVyora-content" fullHref={project.detailsUrl}>
      <article className="min-vyora">
        <header className="min-case-intro">
          <div>
            <p className="min-kicker">{vyoraCase.category}</p>
            <h1 id="minimalVyora-title" tabIndex={-1}>{project.title}</h1>
            <p className="min-case-tagline">{vyoraCase.tagline[0]}<br />{vyoraCase.tagline[1]}</p>
          </div>
          <div className="min-case-intro-copy">
            <p>{project.description} {vyoraCase.summary}</p>
            {project.liveUrl && <a className="min-button min-button-primary" href={project.liveUrl} target="_blank" rel="noopener noreferrer">
              Visit live website<ArrowUpRight size={15} aria-hidden="true" />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>}
          </div>
        </header>

        <dl className="min-case-facts">
          {vyoraCase.facts.map(({ label, value }) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
          <div><dt>Status</dt><dd>{project.status}</dd></div>
        </dl>

        <figure className="min-vyora-preview">
          <a className="min-vyora-screenshot" href="/images/vyora-studio.jpg" target="_blank" rel="noopener noreferrer" aria-label="Open full-size VYORA Studio screenshot (opens in a new tab)">
            <img src="/images/vyora-studio.jpg" width="1920" height="1032" alt="VYORA Studio photo booth home screen with sample photo strips and frame settings" decoding="async" fetchPriority="high" />
          </a>
          <figcaption><span>Windows app · Studio</span><span>Open image for a closer look<ArrowUpRight size={12} aria-hidden="true" /></span></figcaption>
        </figure>

        <section className="min-case-story" aria-labelledby="min-vyora-overview">
          <div className="min-case-story-copy">
            <p className="min-kicker">The idea</p>
            <h2 id="min-vyora-overview">Built for the booth</h2>
            {vyoraCase.overview.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
          </div>
          <figure className="min-vyora-preview">
            <a className="min-vyora-screenshot" href="/images/vyora-website.jpg" target="_blank" rel="noopener noreferrer" aria-label="Open full-size VYORA website screenshot (opens in a new tab)">
              <img src="/images/vyora-website.jpg" width="1920" height="1080" alt="VYORA website with sample photo strips, a Windows download button, and setup guide navigation" loading="lazy" decoding="async" />
            </a>
            <figcaption><span>The website</span><span>Download &amp; setup</span></figcaption>
          </figure>
        </section>

        <section className="min-case-section" aria-labelledby="min-vyora-features">
          <h2 id="min-vyora-features">Inside the experience</h2>
          <ul className="min-case-features">
            {vyoraFeatures.map(({ title, description, icon: Icon }) => <li key={title}>
              <Icon size={18} strokeWidth={1.5} aria-hidden="true" />
              <h3>{title}</h3>
              <p>{description}</p>
            </li>)}
          </ul>
        </section>

        <section className="min-card min-vyora-progress" aria-labelledby="min-vyora-status">
          <h2 className="min-card-title" id="min-vyora-status"><Hammer size={15} aria-hidden="true" />Live, and still growing</h2>
          {vyoraCase.progress.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
        </section>

        <section className="min-card min-case-tools" aria-labelledby="min-vyora-stack">
          <div className="min-case-tools-intro">
            <h2 id="min-vyora-stack">Built with</h2>
            <p>The main tools behind the Windows app, website, and installer.</p>
            <a className="min-text-link" href="/skills">Explore my stack<ArrowRight size={14} aria-hidden="true" /></a>
          </div>
          <div className="min-stack-groups">
            {vyoraStackLayers.map(layer => <div className="min-stack-group" key={layer.id}>
              <h3 id={`min-vyora-stack-${layer.id}`}>{layer.title}</h3>
              <ul className="min-tags min-tags-outlined" aria-label={`${layer.title} technologies`}>
                {layer.tools.map(tool => <li key={tool}>{tool}</li>)}
              </ul>
            </div>)}
          </div>
        </section>

        <section className="min-case-contact" aria-labelledby="min-vyora-contact">
          <div>
            <h2 id="min-vyora-contact">Have a project in mind?</h2>
            <p>I’m open to opportunities and meaningful collaborations.</p>
          </div>
          {email && <a className="min-button min-button-secondary" href={email}>Get in touch<ArrowUpRight size={15} aria-hidden="true" /></a>}
        </section>
      </article>
    </MinimalLayout>
  )
}
