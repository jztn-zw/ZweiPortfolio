import type { ReactNode } from 'react'
import { ArrowUp, Moon, Sun } from 'lucide-react'
import { portfolio } from '../data/portfolio'
import useTheme from '../hooks/useTheme'
import FooterVerse from './FooterVerse'
import '../pages/Minimal.css'

function FullExperienceIcon() {
  return <svg className="min-full-view-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path className="min-full-icon-back" d="M5 8H3.5v12.5H16V19" />
    <g className="min-full-icon-front"><path d="M8 3.5h10l3 3V17H8Z" /><path d="M8 7.5h13M12 10.5v3.5" opacity=".55" /><path className="min-full-icon-accent" d="M15 11h3m-3 3h2M18 3.5v3h3" /></g>
  </svg>
}

export default function MinimalLayout({ children, contentId = 'minimal-content', fullHref = '/' }: { children: ReactNode; contentId?: string; fullHref?: string }) {
  const { theme, toggleTheme } = useTheme()
  return <div className="minimal-view">
    <a className="min-skip" href={`#${contentId}`}>Skip to content</a>
    <div className="min-shell">
      <header className="min-topbar">
        <a href="/minimal" className="min-wordmark" aria-label="Jaztin — Minimal portfolio">
          <img src={theme === 'light' ? '/brand-mark-light.svg' : '/brand-mark.svg'} width="24" height="24" alt="" />
          <span>Jaztin</span>
        </a>
        <nav className="min-top-actions" aria-label="View options">
          <a href={fullHref} className="min-full-view" aria-label="Full experience" title="Full experience"><FullExperienceIcon /></a>
          <button className="min-theme-toggle" type="button" aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} onClick={event => {
            const bounds = event.currentTarget.getBoundingClientRect()
            toggleTheme({ x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 })
          }}>{theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}</button>
        </nav>
      </header>
      <main id={contentId} tabIndex={-1}>{children}</main>
      <footer className="min-footer">
        <div className="min-footer-main">
          <span className="min-footer-copyright">© {new Date().getFullYear()} {portfolio.name}</span>
          <a className="min-text-link min-footer-top" href={`#${contentId}`}>Back to top<ArrowUp size={13} aria-hidden="true" /></a>
        </div>
        <div className="min-footer-note">
          <FooterVerse />
          <span>Always learning. Always building.</span>
        </div>
      </footer>
    </div>
  </div>
}
