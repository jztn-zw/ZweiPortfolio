import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react'
import MinimalLayout from '../components/MinimalLayout'
import { portfolio, projects } from '../data/portfolio'
import { greenwayFeatures, greenwayStackLayers } from '../data/greenway'
import './MinimalDetails.css'

export default function MinimalGreenWay() {
  const project = projects.find(project => project.artwork === 'greenway')
  const email = portfolio.contacts.find(contact => contact.id === 'email')?.url
  if (!project) return <MinimalLayout contentId="minimalGreenway-content"><h1 id="minimalGreenway-title" tabIndex={-1}>Project unavailable.</h1><a className="min-text-link" href="/minimal">Back to portfolio</a></MinimalLayout>

  return <MinimalLayout contentId="minimalGreenway-content" fullHref="/projects/greenway">
    <div className="min-detail-nav"><a className="min-text-link" href="/minimal#min-projects-title"><ArrowLeft size={14} />Back to projects</a><span className="min-kicker">Selected work / 01</span></div>
    <header className="min-detail-intro min-case-intro">
      <p className="min-kicker">Web &amp; mobile application</p>
      <h1 id="minimalGreenway-title" tabIndex={-1}>{project.title}</h1>
      <p>A cleaner routine. A connected community.</p>
      {project.liveUrl && <a className="min-button min-button-primary" href={project.liveUrl} target="_blank" rel="noopener noreferrer">Visit live website<ArrowUpRight size={15} /><span className="sr-only"> (opens in a new tab)</span></a>}
    </header>
    <dl className="min-case-facts"><div><dt>My role</dt><dd>Full-Stack Developer</dd></div><div><dt>Platforms</dt><dd>Web &amp; Mobile</dd></div><div><dt>Built for</dt><dd>Candelaria, Quezon</dd></div><div><dt>Status</dt><dd>{project.status}</dd></div></dl>
    <section className="min-case-media" aria-label="Project previews">
      <figure className="min-case-film"><video controls playsInline preload="none" poster="/images/greenway-showcase-poster.jpg" width="1920" height="1080" aria-label="GreenWay web and mobile showcase"><source src="/videos/greenway-showcase.mp4" type="video/mp4" />Your browser cannot play this video. <a href="/videos/greenway-showcase.mp4">Open the showcase video.</a></video><figcaption>Mobile walkthrough</figcaption></figure>
      <figure className="min-case-screen"><div className="min-case-web-preview"><img src="/images/greenway-web.webp" alt="GreenWay web homepage with collection schedules, tracking, and app access" width="1920" height="1020" loading="lazy" decoding="async" /></div><figcaption>Web application</figcaption></figure>
    </section>
    <div className="min-case-layout">
      <div className="min-column">
        <section className="min-panel" aria-labelledby="min-case-overview"><h2 id="min-case-overview">The idea</h2><p>{project.description}</p><p>Residents shouldn’t have to guess when collection happens or where to raise a concern. GreenWay connects everyday resident needs with schedules, collection updates, and the Municipal Environment and Natural Resources Office.</p></section>
        <section className="min-panel" aria-labelledby="min-case-features"><h2 id="min-case-features">Built around the everyday</h2><ul className="min-case-features">{greenwayFeatures.map(({ title, description, icon: Icon }) => <li key={title}><Icon size={18} strokeWidth={1.5} aria-hidden="true" /><div><h3>{title}</h3><p>{description}</p></div></li>)}</ul></section>
      </div>
      <section className="min-panel" aria-labelledby="min-case-tools"><h2 id="min-case-tools">Under the hood</h2><p>A shared stack connects the resident interface, backend services, maps, and media.</p><div className="min-stack-groups">{greenwayStackLayers.map(layer => <div className="min-stack-group" key={layer.id}><h3>{layer.title}</h3><ul className="min-tags" aria-label={`${layer.title} technologies`}>{project.technologies.filter(tool => layer.tools.some(item => item === tool)).map(tool => <li key={tool}>{tool}</li>)}</ul></div>)}</div><a className="min-text-link min-case-stack-link" href="/minimal/skills">More about my stack<ArrowRight size={14} /></a></section>
    </div>
    <section className="min-detail-next" aria-labelledby="min-case-contact"><div><h2 id="min-case-contact">Have a project in mind?</h2><p>I’m open to opportunities and meaningful collaborations.</p></div>{email && <a className="min-button min-button-primary" href={email}>Get in touch<ArrowUpRight size={15} /></a>}</section>
  </MinimalLayout>
}
