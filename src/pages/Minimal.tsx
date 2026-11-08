import { ArrowRight, ArrowUpRight, BriefcaseBusiness, ChevronRight, CodeXml, FolderOpen, GraduationCap, Mail, UserRound, type LucideIcon } from 'lucide-react'
import { aboutMe, capabilities, journey, portfolio } from '../data/portfolio'
import { projectCollections } from '../data/projectCollections'
import { minimalProjectCollectionHref } from '../lib/routes'
import MinimalLayout from '../components/MinimalLayout'
import './MinimalResume.css'
import './MinimalProjects.css'

function ResumeHeading({ id, icon: Icon, children }: { id: string; icon: LucideIcon; children: string }) {
  return <h2 className="min-card-title" id={id} tabIndex={-1}><Icon size={15} aria-hidden="true" />{children}</h2>
}

export default function Minimal() {
  const email = portfolio.contacts.find(contact => contact.id === 'email')?.url
  const github = portfolio.contacts.find(contact => contact.id === 'github')?.url
  const education = journey.entries.find(entry => entry.id === 'education')
  const experience = journey.entries.filter(entry => entry.id !== 'education')

  return (
    <MinimalLayout>
      <div className="resume-sheet">
        <header className="min-masthead">
          <p className="min-kicker">{portfolio.role}</p>
          <h1 id="minimal-title" tabIndex={-1}>{portfolio.name}</h1>
          <div className="resume-meta">
            <div className="resume-location"><span>{portfolio.location}</span><span className="resume-availability">{portfolio.availability}</span></div>
            <nav className="resume-contact-links" aria-label="Contact">
              {email && <a className="min-text-link" href={email}>Email<ArrowUpRight size={13} aria-hidden="true" /></a>}
              {github && <a className="min-text-link" href={github} target="_blank" rel="noopener noreferrer">GitHub<ArrowUpRight size={13} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>}
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
                <ResumeHeading id="min-stack-title" icon={CodeXml}>Skills</ResumeHeading>
                <a className="min-text-link" href="/minimal/skills">Full stack<ArrowRight size={14} aria-hidden="true" /></a>
              </div>
              <dl className="resume-skill-list">
                {capabilities.map(group => (
                  <div key={group.id}>
                    <dt>{group.title}</dt>
                    <dd>
                      <ul className="min-tags min-tags-outlined" aria-label={`${group.title} technologies`}>
                        {group.technologies.map(technology => <li key={technology}>{technology}</li>)}
                      </ul>
                    </dd>
                  </div>
                ))}
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
              <ResumeHeading id="min-contact-title" icon={Mail}>Let’s connect</ResumeHeading>
              {email && <a className="min-text-link" href={email}>{email.replace(/^mailto:/, '')}<ArrowUpRight size={13} aria-hidden="true" /></a>}
              <a className="min-text-link" href="/ask-ai">Ask me anything<ArrowRight size={14} aria-hidden="true" /></a>
            </section>
          </div>
        </div>
      </div>
    </MinimalLayout>
  )
}
