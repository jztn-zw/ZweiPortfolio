import { ArrowRight, ArrowUpRight, CodeXml, Database, FolderOpen, Workflow } from 'lucide-react'
import MinimalLayout from '../components/MinimalLayout'
import { capabilities, portfolio } from '../data/portfolio'
import './MinimalDetails.css'

const icons = { web: CodeXml, fullstack: Database, automation: Workflow }
const technologyIconIds: Record<(typeof capabilities)[number]['technologies'][number], string> = {
  React: 'react',
  'Next.js': 'nextjs',
  TypeScript: 'typescript',
  'Tailwind CSS': 'tailwind',
  Vite: 'vite',
  'Radix UI': 'radixui',
  'React Router': 'reactrouter',
  'TanStack Query': 'reactquery',
  Zustand: 'zustand',
  Leaflet: 'leaflet',
  'MapLibre React Native': 'maplibre',
  'React Native': 'react',
  Expo: 'expo',
  WordPress: 'wordpress',
  Electron: 'electron',
  'Electron Forge': 'electron',
  NSIS: 'nsis',
  'GitHub Releases': 'github',
  'Node.js': 'node',
  Express: 'express',
  MySQL: 'mysql',
  TiDB: 'tidb',
  SQLite: 'sqlite',
  'Cloudflare Workers': 'cloudflareworkers',
  'Socket.IO': 'socketio',
  Cloudinary: 'cloudinary',
  Vercel: 'vercel',
  Render: 'render',
  Supabase: 'supabase',
  Neon: 'neon',
  MongoDB: 'mongodb',
  Codex: 'codex',
  'Claude Code': 'claude',
  Antigravity: 'antigravity',
  n8n: 'n8n',
  GHL: 'highlevel',
}

export default function MinimalSkills() {
  const tools = new Set(capabilities.flatMap(group => [...group.technologies]))
  const email = portfolio.contacts.find(contact => contact.id === 'email')?.url
  return <MinimalLayout contentId="minimalSkills-content" fullHref="/skills">
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
        <div className="min-card-heading">
          <h2 className="min-card-title" id="min-stack-next"><FolderOpen size={15} aria-hidden="true" />Tools in practice</h2>
          <a className="min-text-link" href="/minimal#min-projects-title">Projects<ArrowRight size={14} aria-hidden="true" /></a>
        </div>
        <p>See how I use these tools in my projects.</p>
        {email && <a className="min-text-link min-stack-contact" href={email}>Let’s connect<ArrowUpRight size={13} aria-hidden="true" /></a>}
      </section>
    </div>
  </MinimalLayout>
}
