import { ArrowUp } from 'lucide-react'
import { portfolio } from '../data/portfolio'
import useTheme from '../hooks/useTheme'
import VisitorCounter from './VisitorCounter'
import FooterVerse from './FooterVerse'
import './Footer.css'

export default function Footer({ topHref = '#home' }: { topHref?: string }) {
  const { theme } = useTheme()
  return (
    <footer className="site-footer page-width">
      <div className="site-footer-top">
        <a href="#home" className="site-footer-identity"><img src={theme === 'light' ? '/brand-mark-light.svg' : '/brand-mark.svg'} className="site-footer-logo" width="30" height="30" alt="" aria-hidden="true" /><span>{portfolio.name}<span className="site-footer-copyright">© 2026</span></span></a>
        <a href={topHref} className="site-footer-back eyebrow" aria-label="Back to top" onClick={event => {
          if (window.location.hash !== topHref) return
          event.preventDefault()
          window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
          document.querySelector<HTMLElement>('main h1')?.focus({ preventScroll: true })
        }}><span><span className="site-footer-back-prefix">BACK TO </span>TOP</span> <ArrowUp size={14} /></a>
      </div>
      <div className="site-footer-bottom">
        <FooterVerse />
        <VisitorCounter />
      </div>
    </footer>
  )
}
