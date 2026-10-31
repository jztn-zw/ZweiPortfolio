import { ArrowLeft, ArrowRight, CodeXml, Database, Workflow } from 'lucide-react'
import MinimalLayout from '../components/MinimalLayout'
import { capabilities, portfolio } from '../data/portfolio'
import './MinimalDetails.css'

const icons = { web: CodeXml, fullstack: Database, automation: Workflow }
const technologyIconIds: Record<string, string> = {
  React: 'react',
  TypeScript: 'typescript',
  'Tailwind CSS': 'tailwind',
  'React Native': 'react',
  Expo: 'expo',
  'Node.js': 'node',
  Express: 'express',
  MySQL: 'mysql',
  Codex: 'codex',
  Antigravity: 'antigravity',
  n8n: 'n8n',
}

export default function MinimalSkills() {
  const tools = new Set(capabilities.flatMap(group => [...group.technologies]))
  const email = portfolio.contacts.find(contact => contact.id === 'email')?.url
  return <MinimalLayout contentId="minimalSkills-content" fullHref="/skills">
    <div className="min-detail-nav"><a className="min-text-link" href="/minimal#min-stack-title"><ArrowLeft size={14} />Back to portfolio</a><span className="min-kicker">Tools &amp; technologies</span></div>
    <header className="min-detail-intro">
      <p className="min-kicker">A closer look</p>
      <h1 id="minimalSkills-title" tabIndex={-1}>The stack behind my work.</h1>
      <p>The tools I use to build web and mobile applications, connect systems, and automate workflows.</p>
      <div className="min-detail-summary"><span><strong>{tools.size}</strong> tools &amp; technologies</span><span><strong>{capabilities.length}</strong> areas of focus</span></div>
    </header>
    <div className="min-detail-stack">{capabilities.map(group => {
      const Icon = icons[group.artwork]
      return <section className="min-discipline" key={group.id} aria-labelledby={`min-discipline-${group.id}`}>
        <div className="min-discipline-intro">
          <div className="min-discipline-heading"><span className="min-small">{group.id}</span><Icon size={18} strokeWidth={1.5} aria-hidden="true" /></div>
          <h2 id={`min-discipline-${group.id}`}>{group.title}</h2>
          <p>{group.description}</p>
        </div>
        <ul className="min-tool-grid">{group.technologies.map(tool => <li className="min-tool-box" key={tool}>
          <svg className="min-tool-icon" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href={`/tech-icons.svg#${technologyIconIds[tool]}`} /></svg>
          <span>{tool}</span>
        </li>)}</ul>
      </section>
    })}</div>
    <section className="min-detail-next" aria-labelledby="min-stack-next"><div><h2 id="min-stack-next">See the tools in practice.</h2><p>GreenWay brings web, mobile, and backend services together.</p></div><a className="min-button min-button-secondary" href="/minimal/projects/greenway">Explore GreenWay<ArrowRight size={15} /></a></section>
    {email && <p className="min-detail-note">Have something in mind? <a className="min-text-link" href={email}>Let’s connect<ArrowRight size={13} /></a></p>}
  </MinimalLayout>
}
