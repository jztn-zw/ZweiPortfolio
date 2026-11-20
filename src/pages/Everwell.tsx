import { ArrowLeft, ArrowUpRight, Bell, ClipboardList, MailCheck, StickyNote } from 'lucide-react'
import MinimalLayout from '../components/MinimalLayout'
import SiteHeader from '../components/SiteHeader'
import Footer from '../components/Footer'
import { portfolio, projects } from '../data/portfolio'
import './Everwell.css'

const workflow = [
  {
    title: 'Contact form submitted',
    description: 'Collect the visitor’s name, email, and message.',
    icon: ClipboardList,
  },
  {
    title: 'Add a note',
    description: 'Record inquiry context for the team.',
    icon: StickyNote,
  },
  {
    title: 'Notify the team',
    description: 'Email the team so they can review the inquiry.',
    icon: Bell,
  },
  {
    title: 'Send inquiry confirmation',
    description: 'Acknowledge the request by email.',
    icon: MailCheck,
  },
]

export default function Everwell({ minimal = false }: { minimal?: boolean }) {
  const project = projects.find(item => item.id === 'everwell')!
  const titleId = minimal ? 'minimalEverwell-title' : 'everwell-title'
  const email = portfolio.contacts.find(contact => contact.id === 'email')!.url!
  const content = <article className="everwell-case">
    <header className="everwell-intro">
      <p className="everwell-category">{project.category}</p>
      <h1 id={titleId} tabIndex={-1}>{project.title}</h1>
      <p>A clinic website with a simple path from browsing services to sending an inquiry.</p>
      <span className="everwell-status">{project.status}</span>
    </header>
    <dl className="everwell-facts">
      <div><dt>Project type</dt><dd>Independent portfolio demo</dd></div>
      <div><dt>Focus</dt><dd>Website &amp; inquiry automation</dd></div>
      <div><dt>Tools</dt><dd>WordPress &amp; GoHighLevel</dd></div>
    </dl>
    <section className="everwell-story" aria-labelledby="everwell-overview">
      <div><h2 id="everwell-overview">Clear services.<br />An easier way to inquire.</h2></div>
      <div><p>I built the WordPress website to guide visitors from clinic services to a contact form. The draft workflow records the inquiry, alerts the team, and sends a confirmation—giving the team a clear starting point for follow-up.</p></div>
    </section>
    <section className="everwell-previews" aria-labelledby="everwell-previews">
      <h2 id="everwell-previews">Project preview</h2>
      <figure>
        <a className="everwell-website-preview" href="/images/everwell/website.jpg" target="_blank" rel="noreferrer" aria-label="Open the full Everwell website screenshot">
          <img src="/images/everwell/website.jpg" alt="Everwell WordPress clinic website with veterinary services, first-visit guidance, and a request-a-visit section" loading="lazy" decoding="async" />
        </a>
        <figcaption>Website preview · Public launch pending. Select to view the full page.</figcaption>
      </figure>
    </section>
    <section className="everwell-automation" aria-labelledby="everwell-workflow">
      <h2 id="everwell-workflow">How inquiries flow</h2>
      <div className="everwell-workflow-layout">
      <ol className="everwell-flow">
        {workflow.map(({ title, description, icon: Icon }) => <li key={title}>
          <span className="everwell-step-icon"><Icon size={20} strokeWidth={1.5} aria-hidden="true" /></span>
          <div><h3>{title}</h3><p>{description}</p></div>
        </li>)}
      </ol>
      <figure className="everwell-workflow-image">
        <a href="/images/everwell/workflow.jpg" target="_blank" rel="noreferrer" aria-label="Open the GoHighLevel workflow screenshot">
          <img src="/images/everwell/workflow.jpg" alt="GoHighLevel draft workflow: form submitted, record inquiry, notify demo team, then send confirmation" loading="lazy" decoding="async" width="1528" height="686" />
        </a>
        <figcaption>GoHighLevel workflow · Select to enlarge.</figcaption>
      </figure>
      </div>
      <p className="everwell-scope-note">Form submission accepted · Zero configuration errors. The test confirmation reached Spam; inbox placement needs work. Workflow remains a draft; full execution is unverified.</p>
    </section>
    <section className="everwell-story everwell-client" aria-labelledby="everwell-client">
      <div><h2 id="everwell-client">Need something similar?</h2></div>
      <div><p>I can help connect your WordPress website to a GoHighLevel inquiry form and a response workflow tailored to your business.</p><a className="everwell-contact" href={`${email}?subject=Website%20and%20inquiry%20automation%20project`}>Let’s discuss your website<ArrowUpRight size={16} aria-hidden="true" /></a></div>
    </section>
  </article>

  if (minimal) return <MinimalLayout contentId="minimalEverwell-content" fullHref="/projects/everwell">{content}</MinimalLayout>
  return <>
    <a className="skip-link" href="#everwell-content">Skip to content</a>
    <SiteHeader isHome={false} />
    <main className="page-width everwell-full" id="everwell-content" tabIndex={-1}>
      <a className="page-back-button" href="/projects/automation" data-project-back><ArrowLeft size={16} aria-hidden="true" />Back to projects</a>
      {content}
    </main>
    <Footer topHref="/projects/everwell" />
  </>
}
