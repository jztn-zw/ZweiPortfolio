import { useRef, useState, type FormEvent } from 'react'
import { ArrowRight, ArrowUpRight, BriefcaseBusiness, ChevronRight, CodeXml, FolderOpen, GraduationCap, Mail, UserRound, X, type LucideIcon } from 'lucide-react'
import { aboutMe, capabilities, journey, portfolio } from '../data/portfolio'
import { technologyIconIds } from '../data/skills'
import { projectCollections } from '../data/projectCollections'
import { minimalProjectCollectionHref } from '../lib/routes'
import MinimalLayout from '../components/MinimalLayout'
import MinimalGitHubCalendar from '../components/MinimalGitHubCalendar'
import MinimalChatOverlay from '../components/MinimalChatOverlay'
import './MinimalResume.css'
import './MinimalProjects.css'

const featuredTechnologies = {
  web: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'React Native', 'Expo', 'WordPress', 'Electron'],
  fullstack: ['Node.js', 'Express', 'MySQL', 'TiDB', 'Supabase', 'MongoDB', 'Vercel', 'SQLite'],
}

// Add public profile URLs here when they are ready to share.
const socialProfiles: { label: string; url: string | null }[] = [
  { label: 'Facebook', url: null },
  { label: 'Instagram', url: null },
  { label: 'TikTok', url: null },
]

function ResumeHeading({ id, icon: Icon, children }: { id: string; icon: LucideIcon; children: string }) {
  return <h2 className="min-card-title" id={id} tabIndex={-1}><Icon size={15} aria-hidden="true" />{children}</h2>
}

function ConnectionLabel({ label }: { label: string }) {
  return <span className="resume-connection-name"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><use href={`/tech-icons.svg#${label.toLowerCase()}`} /></svg>{label}</span>
}

export default function Minimal() {
  const connectionsDialog = useRef<HTMLDialogElement>(null)
  const emailDialog = useRef<HTMLDialogElement>(null)
  const sending = useRef(false)
  const submissionId = useRef<string | null>(null)
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [emailError, setEmailError] = useState('')
  const email = portfolio.contacts.find(contact => contact.id === 'email')?.url
  const github = portfolio.contacts.find(contact => contact.id === 'github')?.url
  const linkedin = portfolio.contacts.find(contact => contact.id === 'linkedin')?.url
  const otherConnections = [
    { label: 'GitHub', url: github },
    ...socialProfiles,
  ]
  const education = journey.entries.find(entry => entry.id === 'education')
  const experience = journey.entries.filter(entry => entry.id !== 'education')

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (sending.current) return
    const form = event.currentTarget
    const fields = new FormData(form)
    submissionId.current ??= crypto.randomUUID()
    sending.current = true
    setEmailStatus('sending')
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fields.get('email'), message: fields.get('message'), website: fields.get('website'), submissionId: submissionId.current }),
        signal: AbortSignal.timeout(15000),
      })
      const result = await response.json()
      if (!response.ok || result.sent !== true) {
        setEmailError(response.status === 503 ? 'Email delivery is being set up or is temporarily unavailable. Please try again later.' : response.status === 429 ? 'Please wait a few minutes before sending another message.' : 'Your message could not be sent. Check your details and try again.')
        setEmailStatus('error')
        return
      }
      form.reset()
      submissionId.current = null
      setEmailStatus('sent')
    } catch {
      setEmailError('We couldn’t confirm delivery. Please check your connection and try again.')
      setEmailStatus('error')
    } finally {
      sending.current = false
    }
  }

  return (
    <MinimalLayout resume>
      <div className="resume-sheet">
        <header className="min-masthead">
          <p className="min-kicker">{portfolio.role}</p>
          <h1 id="minimal-title" tabIndex={-1}>{portfolio.name}</h1>
          <div className="resume-meta">
            <div className="resume-location"><span>{portfolio.location}</span><span className="resume-availability">{portfolio.availability}</span></div>
            <nav className="resume-contact-links" aria-label="Contact">
              {email && <button className="min-text-link resume-email-trigger" type="button" aria-haspopup="dialog" onClick={() => emailDialog.current?.showModal()}>Email<ArrowUpRight size={13} aria-hidden="true" /></button>}
              <span className="resume-header-pending" aria-label="Résumé coming soon">Résumé<span className="resume-contact-soon">Soon</span></span>
            </nav>
          </div>
        </header>

        <div className="min-card-grid">
          <div className="min-column">
            <section className="min-card resume-about" aria-labelledby="min-about-title">
              <ResumeHeading id="min-about-title" icon={UserRound}>About</ResumeHeading>
              <p className="resume-profile">I’m a fourth-year Computer Science student building web and mobile applications. My focus is on <strong>{aboutMe.focus}</strong>, and I learn best by trying things myself.</p>
              <blockquote>“{aboutMe.quote}”</blockquote>
            </section>

            <section className="min-card" aria-labelledby="min-stack-title">
              <div className="min-card-heading">
                <ResumeHeading id="min-stack-title" icon={CodeXml}>Tech stack</ResumeHeading>
                <a className="min-text-link" href="/minimal/skills" aria-label="View all technologies">View all<ArrowRight size={14} aria-hidden="true" /></a>
              </div>
              <dl className="resume-skill-list">
                {capabilities.map(group => {
                  const featured = group.technologies.filter(technology => group.artwork === 'automation' || featuredTechnologies[group.artwork].includes(technology))
                  const remaining = group.technologies.length - featured.length
                  return (
                    <div key={group.id}>
                      <dt>{group.title}</dt>
                      <dd>
                        <ul className="min-tags min-tags-outlined" aria-label={`${group.title} technologies`}>
                          {featured.map(technology => <li key={technology}>
                            <svg className="min-tool-icon" width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href={`/tech-icons.svg#${technologyIconIds[technology]}`} /></svg>
                            {technology}
                          </li>)}
                          {remaining > 0 && <li className="resume-skill-more"><a href="/minimal/skills" aria-label={`View ${remaining} more ${group.title} technologies`}>+{remaining} more</a></li>}
                        </ul>
                      </dd>
                    </div>
                  )
                })}
              </dl>
            </section>

            <section className="min-card resume-work" aria-labelledby="min-projects-title">
              <div className="min-card-heading">
                <ResumeHeading id="min-projects-title" icon={FolderOpen}>Projects</ResumeHeading>
                <a className="min-text-link" href="/minimal/projects">View all<ArrowRight size={14} aria-hidden="true" /></a>
              </div>
              <div className="min-project-summaries">
                {projectCollections.map(collection => (
                  <a className="min-project-summary" key={collection.id} href={minimalProjectCollectionHref(collection.id)}>
                    <h3>{collection.title}<ChevronRight className="min-collection-chevron" size={12} aria-hidden="true" /></h3>
                    <p>{collection.description}</p>
                  </a>
                ))}
              </div>
            </section>

            {github && <MinimalGitHubCalendar />}
          </div>

          <div className="min-column">
            <section className="min-card" aria-labelledby="min-experience-title">
              <ResumeHeading id="min-experience-title" icon={BriefcaseBusiness}>Experience</ResumeHeading>
              <ol className="resume-experience">
                {experience.map(entry => (
                  <li key={entry.id}>
                    <span className="resume-date">{entry.date}</span>
                    <div>
                      <h3>{entry.title}</h3>
                      <p className="resume-context">{entry.context}</p>
                      <p>{entry.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {education && (
              <section className="min-card resume-education" aria-labelledby="min-education-title">
                <ResumeHeading id="min-education-title" icon={GraduationCap}>Education</ResumeHeading>
                <p className="resume-date">Currently studying</p>
                <h3>BS Computer Science</h3>
                <p className="resume-context">{education.context}</p>
                <p>{education.description}</p>
              </section>
            )}

            <section className="min-card resume-contact" id="minimal-contact" aria-labelledby="min-contact-title">
              <div className="min-card-heading">
                <ResumeHeading id="min-contact-title" icon={Mail}>Let’s connect</ResumeHeading>
                <button className="min-text-link resume-contact-more" type="button" aria-haspopup="dialog" onClick={() => connectionsDialog.current?.showModal()}>More connections<ArrowRight size={14} aria-hidden="true" /></button>
              </div>
              <p className="resume-contact-intro">Have an idea or an opportunity? Let’s talk.</p>
              {email && <button className="resume-contact-method resume-email-trigger" type="button" aria-haspopup="dialog" onClick={() => emailDialog.current?.showModal()}>
                <span className="resume-contact-icon"><Mail size={18} aria-hidden="true" /></span>
                <span className="resume-contact-method-copy"><span>Send me an email</span><strong>{email.replace(/^mailto:/, '')}</strong></span>
                <ArrowUpRight className="resume-contact-arrow" size={18} aria-hidden="true" />
              </button>}
              {linkedin
                ? <a className="resume-contact-method" href={linkedin} target="_blank" rel="noopener noreferrer">
                  <span className="resume-contact-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.049c.476-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124Zm1.782 13.019H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0Z" /></svg></span>
                  <span className="resume-contact-method-copy"><span>Connect on LinkedIn</span><strong>{portfolio.name}</strong></span>
                  <ArrowUpRight className="resume-contact-arrow" size={18} aria-hidden="true" />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
                : <div className="resume-contact-pending"><span>LinkedIn</span><span className="resume-contact-soon">Soon</span></div>}
              <div className="resume-contact-actions">
                <MinimalChatOverlay />
              </div>
              <dialog className="resume-connections-dialog" ref={connectionsDialog} aria-labelledby="resume-connections-title" onClick={event => { if (event.target === event.currentTarget) event.currentTarget.close() }}>
                <div className="resume-connections-heading">
                  <ResumeHeading id="resume-connections-title" icon={UserRound}>More connections</ResumeHeading>
                  <form method="dialog"><button className="resume-connections-close" aria-label="Close connections" type="submit"><X size={17} aria-hidden="true" /></button></form>
                </div>
                <div className="resume-connections-list">
                  {otherConnections.map(profile => profile.url
                    ? <a className="min-text-link" key={profile.label} href={profile.url} target="_blank" rel="noopener noreferrer"><ConnectionLabel label={profile.label} /><ArrowUpRight size={13} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>
                    : <div className="resume-contact-pending" key={profile.label}><ConnectionLabel label={profile.label} /><span className="resume-contact-soon">Soon</span></div>)}
                </div>
              </dialog>
            </section>
          </div>
        </div>
      </div>
      <dialog className="resume-connections-dialog resume-email-dialog" ref={emailDialog} aria-labelledby="resume-email-title" onClick={event => { if (event.target === event.currentTarget) event.currentTarget.close() }}>
        <div className="resume-email-top">
          <div className="resume-email-heading">
            <span className="resume-email-mark"><Mail size={20} aria-hidden="true" /></span>
            <div><h2 id="resume-email-title">Send a message</h2><p>A project, a question, or just a hello.</p></div>
          </div>
          <form method="dialog"><button className="resume-connections-close" type="submit" aria-label="Close email form"><X size={17} aria-hidden="true" /></button></form>
        </div>
        <div className="resume-email-recipient"><span>To</span><span className="resume-email-avatar">J</span><span><strong>Jaztin Contreras</strong><span>{email?.replace(/^mailto:/, '')}</span></span></div>
          <form className="resume-email-form" onSubmit={sendMessage} onChange={() => { submissionId.current = null; if (!sending.current) setEmailStatus('idle') }} aria-busy={emailStatus === 'sending'}>
            <label htmlFor="contact-email">Your email</label>
            <input id="contact-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required maxLength={254} disabled={emailStatus === 'sending'} />
            <label htmlFor="contact-message">Message</label>
            <textarea id="contact-message" name="message" placeholder="Tell me a little about what you have in mind…" required minLength={10} maxLength={5000} rows={5} disabled={emailStatus === 'sending'} />
            <div className="resume-email-trap" aria-hidden="true"><label>Website<input name="website" autoComplete="off" tabIndex={-1} /></label></div>
            <div className="resume-email-footer"><span>I’ll reply to your email.</span><button className="min-button min-button-primary" type="submit" disabled={emailStatus === 'sending'}>{emailStatus === 'sending' ? 'Sending…' : 'Send message'}<ArrowUpRight size={14} aria-hidden="true" /></button></div>
            <p className="resume-email-status" role="status">{emailStatus === 'sent' ? 'Your message has been sent. Thank you for reaching out.' : emailStatus === 'error' ? emailError : ''}</p>
          </form>
      </dialog>
    </MinimalLayout>
  )
}
