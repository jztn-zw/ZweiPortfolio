import { ArrowLeft, ArrowRight, ArrowUpRight, BriefcaseBusiness, CodeXml, FileText, GraduationCap, Mail, MapPin, Moon, Sun, UserRound } from 'lucide-react'
import { aboutMe, capabilities, journey, portfolio, projects } from '../data/portfolio'
import FooterVerse from '../components/FooterVerse'
import useTheme from '../hooks/useTheme'
import './Minimal.css'

export default function Minimal() {
  const { theme, toggleTheme } = useTheme()
  const email = portfolio.contacts.find(contact => contact.id === 'email')?.url
  const github = portfolio.contacts.find(contact => contact.id === 'github')?.url
  const education = journey.entries.find(entry => entry.id === 'education')
  const experience = journey.entries.filter(entry => entry.id !== 'education')
  const publishedProjects = projects.filter(project => project.detailsUrl || project.liveUrl)

  return <div className="minimal-view">
    <a className="min-skip" href="#minimal-content">Skip to content</a>
    <div className="min-shell">
      <header className="min-topbar">
        <a href="/minimal" className="min-wordmark" aria-label="Jaztin — Minimal portfolio">
          <img src={theme === 'light' ? '/brand-mark-light.svg' : '/brand-mark.svg'} width="24" height="24" alt="" />
          <span>Jaztin<span className="min-wordmark-dot">.</span></span>
        </a>
        <nav className="min-top-actions" aria-label="View options">
          <a href="/" className="min-full-view"><ArrowLeft size={14} /><span>Full experience</span></a>
          <button className="min-theme-toggle" type="button" aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} onClick={event => {
            const bounds = event.currentTarget.getBoundingClientRect()
            toggleTheme({ x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 })
          }}>{theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}</button>
        </nav>
      </header>

      <main id="minimal-content" tabIndex={-1}>
        <section className="min-profile" aria-labelledby="minimal-title">
          <img className="min-avatar" src="/images/jaztin-about-editorial.webp" width="112" height="112" alt="Jaztin wearing glasses, a cap, and a plaid cardigan" decoding="async" />
          <div className="min-profile-copy">
            <div className="min-profile-meta"><span className="min-kicker">A little about me</span><span className="min-availability"><i aria-hidden="true" />{portfolio.availability}</span></div>
            <h1 id="minimal-title" tabIndex={-1}>{portfolio.name}</h1>
            <p className="min-location"><MapPin size={13} />{portfolio.location}</p>
            <p className="min-role">{portfolio.role}<span aria-hidden="true"> / </span><span>Curious by nature. Hands-on by choice.</span></p>
            <div className="min-profile-actions">
              {email && <a className="min-button min-button-primary" href={email}><Mail size={15} />Get in touch<ArrowUpRight size={14} /></a>}
              <button className="min-button min-button-secondary" type="button" disabled><FileText size={15} />Resume<span className="min-soon">Soon</span></button>
            </div>
          </div>
        </section>

        <div className="min-layout">
          <div className="min-column">
            <section className="min-panel" aria-labelledby="min-about-title">
              <h2 id="min-about-title"><UserRound size={16} />About</h2>
              <p>{aboutMe.introduction}</p>
              <p>My focus is on <strong>{aboutMe.focus}</strong>. {aboutMe.exploration}</p>
              <p>I learn best by building, trying things out, and figuring out the logic behind them.</p>
              <blockquote>“{aboutMe.quote}”</blockquote>
            </section>

            <section className="min-panel" aria-labelledby="min-stack-title">
              <div className="min-section-heading"><h2 id="min-stack-title"><CodeXml size={16} />Tools I work with</h2><a className="min-text-link" href="/skills">Full stack<ArrowUpRight size={13} /></a></div>
              <div className="min-stack-groups">{capabilities.map(group => <div className="min-stack-group" key={group.id}>
                <h3>{group.title}</h3>
                <ul className="min-tags" aria-label={group.title}>{group.technologies.map(technology => <li key={technology}>{technology}</li>)}</ul>
              </div>)}</div>
            </section>

            <section className="min-panel min-projects" aria-labelledby="min-projects-title">
              <div className="min-section-heading"><h2 id="min-projects-title"><BriefcaseBusiness size={16} />Selected work</h2><span className="min-small">{String(publishedProjects.length).padStart(2, '0')} / Published</span></div>
              {publishedProjects.length ? publishedProjects.map(project => <article className="min-project" key={project.id}>
                {project.artwork === 'greenway' && <a className="min-project-preview" href={project.detailsUrl ?? project.liveUrl} aria-label={`Read about ${project.title}`}><img src="/images/greenway-showcase-poster.jpg" width="1920" height="1080" alt="GreenWay Candelaria application showing collection schedules, truck tracking, and resident reports" loading="lazy" decoding="async" /><span>Inside the project<ArrowUpRight size={16} /></span></a>}
                <div className="min-project-title"><h3>{project.title}</h3>{project.status && <span className="min-project-status">{project.status}</span>}</div>
                <p>{project.description}</p>
                <ul className="min-tags" aria-label={`${project.title} technologies`}>{project.technologies.slice(0, 4).map(technology => <li key={technology}>{technology}</li>)}</ul>
                <div className="min-project-links">
                  {project.detailsUrl && <a className="min-text-link" href={project.detailsUrl}>View project<ArrowRight size={14} /></a>}
                  {project.liveUrl && <a className="min-text-link" href={project.liveUrl} target="_blank" rel="noopener noreferrer">Live website<ArrowUpRight size={14} /><span className="sr-only"> (opens in a new tab)</span></a>}
                </div>
              </article>) : <p>New projects will appear here as they’re ready to share.</p>}
            </section>
          </div>

          <div className="min-column">
            <section className="min-panel" aria-labelledby="min-experience-title">
              <h2 id="min-experience-title"><BriefcaseBusiness size={16} />Experience</h2>
              <ol className="min-timeline">{experience.map(entry => <li key={entry.id}>
                <div className="min-entry-heading"><h3>{entry.title}</h3><span>{entry.date}</span></div>
                <p className="min-entry-context">{entry.context}</p>
                <p>{entry.description}</p>
              </li>)}</ol>
            </section>

            {education && <section className="min-panel" aria-labelledby="min-education-title">
              <h2 id="min-education-title"><GraduationCap size={17} />Education</h2>
              <div className="min-education"><span className="min-small">Currently studying</span><h3>{education.title}</h3><p>{education.context}</p><p>{education.description}</p></div>
            </section>}

            <section id="minimal-contact" className="min-panel min-contact" aria-labelledby="min-contact-title">
              <h2 id="min-contact-title"><Mail size={16} />Let’s connect</h2>
              <p>Have a project in mind or an opportunity to share? I’d be happy to hear from you.</p>
              {email && <a href={email} className="min-email">{email.replace(/^mailto:/, '')}<ArrowUpRight size={15} /></a>}
              <div className="min-socials">
                {github && <a className="min-text-link" href={github} target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" fill="currentColor"><path d="M12 .3A12 12 0 0 0 8.2 23.7c.6.1.8-.3.8-.6v-2.3c-3.4.7-4.1-1.4-4.1-1.4-.5-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.4-5.5-6A4.7 4.7 0 0 1 5.5 8c-.1-.3-.5-1.6.1-3.3 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.7.2 3 .1 3.3a4.7 4.7 0 0 1 1.2 3.3c0 4.6-2.8 5.7-5.5 6 .4.4.8 1.1.8 2.2v3.6c0 .3.2.7.8.6A12 12 0 0 0 12 .3Z" /></svg>GitHub<ArrowUpRight size={12} /><span className="sr-only"> (opens in a new tab)</span></a>}
                <span className="min-unavailable">LinkedIn<span className="min-soon">Soon</span></span>
              </div>
              <a className="min-ask-link" href="/ask-ai"><span>Want to know more about me?</span>Ask me anything<ArrowRight size={14} /></a>
            </section>

            <aside className="min-offline" aria-label="Outside of work"><span className="min-kicker">Off the keyboard</span><p>Basketball, Mobile Legends, and a guitar nearby. Always curious about something new.</p></aside>
          </div>
        </div>
      </main>

      <footer className="min-footer"><div><span>© {new Date().getFullYear()} {portfolio.name}</span><div className="min-footer-note"><FooterVerse /><span>Always learning. Always building.</span></div></div><a className="min-text-link" href="#minimal-content">Back to top<ArrowUpRight size={13} /></a></footer>
    </div>
  </div>
}
