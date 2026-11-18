import { ArrowRight, ArrowUpRight } from 'lucide-react'
import MinimalLayout from '../components/MinimalLayout'
import { portfolio, projects } from '../data/portfolio'
import { greenwayFeatures, greenwayStackLayers } from '../data/greenway'
import './MinimalDetails.css'
import './MinimalGreenWay.css'

export default function MinimalGreenWay() {
  const project = projects.find(project => project.artwork === 'greenway')
  const email = portfolio.contacts.find(contact => contact.id === 'email')?.url
  if (!project) {
    return (
      <MinimalLayout contentId="minimalGreenway-content">
        <h1 id="minimalGreenway-title" tabIndex={-1}>Project unavailable</h1>
        <a className="min-text-link" href="/minimal#min-projects-title" data-project-back>Back to projects</a>
      </MinimalLayout>
    )
  }

  return (
    <MinimalLayout contentId="minimalGreenway-content" fullHref="/projects/greenway">
      <article className="min-case">
        <header className="min-case-intro">
          <div>
            <p className="min-kicker">Web &amp; mobile application</p>
            <h1 id="minimalGreenway-title" tabIndex={-1}>{project.title}</h1>
            <p className="min-case-tagline">A cleaner routine.<br />A connected community.</p>
          </div>
          <div className="min-case-intro-copy">
            <p>{project.description}</p>
            {project.liveUrl && (
              <a className="min-button min-button-primary" href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                Visit live website<ArrowUpRight size={15} aria-hidden="true" />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            )}
          </div>
        </header>

        <dl className="min-case-facts">
          <div><dt>My role</dt><dd>Full-Stack Developer</dd></div>
          <div><dt>Platforms</dt><dd>Web &amp; Mobile</dd></div>
          <div><dt>Built for</dt><dd>Candelaria, Quezon</dd></div>
          {project.status && <div><dt>Status</dt><dd>{project.status}</dd></div>}
        </dl>

        <figure className="min-case-film">
          <video controls playsInline preload="none" poster="/images/greenway-showcase-poster.jpg" width="1920" height="1080" aria-label="GreenWay web and mobile showcase">
            <source src="/videos/greenway-showcase.mp4" type="video/mp4" />
            Your browser cannot play this video. <a href="/videos/greenway-showcase.mp4">Open the showcase video.</a>
          </video>
          <figcaption><span>Product walkthrough</span><span>Mobile experience</span></figcaption>
        </figure>

        <section className="min-case-story" aria-labelledby="min-case-overview">
          <div className="min-case-story-copy">
            <p className="min-kicker">The idea</p>
            <h2 id="min-case-overview">Less guesswork<br />More connection</h2>
            <p>Residents shouldn’t have to guess when collection happens or where to raise a concern. GreenWay brings collection schedules, updates, and resident services into one place.</p>
            <p>Built for Candelaria, Quezon, it connects the community with the Municipal Environment and Natural Resources Office.</p>
          </div>
          <figure className="min-case-screen">
            <div className="min-case-web-preview">
              <img src="/images/greenway-web.webp" alt="GreenWay web homepage with collection schedules, tracking, and app access" width="1920" height="1020" loading="lazy" decoding="async" />
            </div>
            <figcaption>The web experience</figcaption>
          </figure>
        </section>

        <section className="min-case-section" aria-labelledby="min-case-features">
          <h2 id="min-case-features">Built around the everyday</h2>
          <ul className="min-case-features">
            {greenwayFeatures.map(({ title, description, icon: Icon }) => (
              <li key={title}>
                <Icon size={18} strokeWidth={1.5} aria-hidden="true" />
                <h3>{title}</h3>
                <p>{description}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="min-card min-case-tools" aria-labelledby="min-case-tools">
          <div className="min-case-tools-intro">
            <h2 id="min-case-tools">Built with</h2>
            <p>The main tools behind the website, mobile apps, API, and deployment.</p>
            <a className="min-text-link" href="/minimal/skills">Explore my stack<ArrowRight size={14} aria-hidden="true" /></a>
          </div>
          <div className="min-stack-groups">
            {greenwayStackLayers.map(layer => (
              <div className="min-stack-group" key={layer.id}>
                <h3>{layer.title}</h3>
                <ul className="min-tags min-tags-outlined" aria-label={`${layer.title} technologies`}>
                  {layer.tools.map(tool => <li key={tool}>{tool}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="min-case-contact" aria-labelledby="min-case-contact">
          <div>
            <h2 id="min-case-contact">Have a project in mind?</h2>
            <p>I’m open to opportunities and meaningful collaborations.</p>
          </div>
          {email && <a className="min-button min-button-secondary" href={email}>Get in touch<ArrowUpRight size={15} aria-hidden="true" /></a>}
        </section>
      </article>
    </MinimalLayout>
  )
}
