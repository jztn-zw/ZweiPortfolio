import { ArrowRight, ArrowUpRight, CodeXml, Database, FolderOpen, Workflow } from 'lucide-react'
import MinimalLayout from '../components/MinimalLayout'
import { capabilities, portfolio } from '../data/portfolio'
import { technologyIconIds } from '../data/skills'
import './MinimalDetails.css'

const icons = { web: CodeXml, fullstack: Database, automation: Workflow }

export default function MinimalSkills() {
  const tools = new Set(capabilities.flatMap(group => [...group.technologies]))
  const email = portfolio.contacts.find(contact => contact.id === 'email')?.url
  return <MinimalLayout contentId="minimalSkills-content" fullHref="/experience/skills">
    <header className="min-masthead min-stack-intro">
      <h1 id="minimalSkills-title" tabIndex={-1}>Tech stack</h1>
      <p>The tools I use to build web, mobile, and desktop applications, connect systems, and automate workflows.</p>
      <div className="min-stack-summary"><span>{tools.size} tools &amp; technologies</span><span>{capabilities.length} areas of focus</span></div>
    </header>

    <div className="min-card-grid min-stack-cards">
      {capabilities.map(group => {
        const Icon = icons[group.artwork]
        return <section className="min-card" key={group.id} aria-labelledby={`min-discipline-${group.id}`}>
          <h2 className="min-card-title" id={`min-discipline-${group.id}`}><Icon size={15} aria-hidden="true" />{group.title}</h2>
          <p>{group.description}</p>
          <ul className="min-tags min-tags-outlined" aria-label={`${group.title} technologies`}>
            {group.technologies.map(tool => <li key={tool}>
              <svg className="min-tool-icon" width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href={`/tech-icons.svg#${technologyIconIds[tool]}`} /></svg>
              {tool}
            </li>)}
          </ul>
        </section>
      })}

      <section className="min-card min-stack-work" aria-labelledby="min-stack-next">
        <div className="min-stack-work-copy">
          <h2 className="min-card-title" id="min-stack-next"><FolderOpen size={15} aria-hidden="true" />Tools in practice</h2>
          <p>See how I use these tools in my projects.</p>
        </div>
        <div className="min-stack-work-actions">
          <a className="min-button min-button-secondary" href="/#min-projects-title">Projects<ArrowRight size={14} aria-hidden="true" /></a>
          {email && <a className="min-text-link" href={email}>Let’s connect<ArrowUpRight size={13} aria-hidden="true" /></a>}
        </div>
      </section>
    </div>
  </MinimalLayout>
}
