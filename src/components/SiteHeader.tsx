import { portfolio } from '../data/portfolio'
import FloatingNavbar from './FloatingNavbar'
import ThemeIcon from './ThemeIcon'
import useTheme from '../hooks/useTheme'
import './SiteHeader.css'

export default function SiteHeader({ isHome = true, isNumbers = false, isAI = false }: { isHome?: boolean; isNumbers?: boolean; isAI?: boolean }) {
  const { theme, toggleTheme } = useTheme()
  const themeAction = `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`
  return (
    <header className="site-header">
      <div className="site-header-inner page-width">
        <div className="site-header-brand">
          <a href="/experience" className="wordmark" aria-label={`${portfolio.name} — Home`}>
            <img src={theme === 'light' ? '/brand-mark-light.svg' : '/brand-mark.svg'} className="brand-mark" width="32" height="32" alt="" aria-hidden="true" />
            <span className="site-header-name">{portfolio.shortName.toUpperCase()}</span>
          </a>
        </div>
        <div className="site-header-actions">
          <FloatingNavbar isHome={isHome} isNumbers={isNumbers} isAI={isAI} />
          <span className="side-nav-divider" aria-hidden="true" />
          <button type="button" data-guide="theme" className="side-nav-item theme-mode-button" aria-label={themeAction} onClick={event => {
            const bounds = event.currentTarget.getBoundingClientRect()
            toggleTheme({ x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 })
          }} aria-describedby="theme-mode-tooltip">
            <ThemeIcon theme={theme} />
            <span className="side-nav-tooltip" id="theme-mode-tooltip" role="tooltip">{themeAction}</span>
          </button>
        </div>
      </div>
    </header>
  )
}
