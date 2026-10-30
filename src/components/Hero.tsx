import { ArrowDown, FileText, Mail } from 'lucide-react'
import { portfolio } from '../data/portfolio'
import PortraitReveal from './PortraitReveal'
import GraphicMark from './GraphicMark'
import HeroGuide from './HeroGuide'
import useDesktopPortrait from '../hooks/useDesktopPortrait'
import './Hero.css'

export default function Hero() {
  const desktopPortrait = useDesktopPortrait()

  return (
    <section className="hero hero--portrait page-width" aria-labelledby="hero-title">
      <div className="hero-portrait-background" aria-hidden="true">
        <img src="/images/jaztin-portrait.webp" alt="" width="941" height="1672" decoding="async" fetchPriority="high" />
      </div>
      <div className="hero-copy">
        <p className="eyebrow hero-eyebrow">
          <span className="red">HELLO, I’M</span>
          <span className="hero-eyebrow-line" />
          A CURIOUS MIND AT WORK
        </p>

        <div className="hero-name-wrap">
          <span className="hero-name-echo echo-above" aria-hidden="true">
            {portfolio.nameLines.map(line => <span key={line}>{line}</span>)}
          </span>
          <h1 id="hero-title" className="hero-name" aria-label={portfolio.name} tabIndex={-1}>
            <span>{portfolio.nameLines[0]}</span>
            <span>{portfolio.nameLines[1]}<span className="red">.</span></span>
          </h1>
          <span className="hero-name-echo echo-below" aria-hidden="true">
            {portfolio.nameLines.map(line => <span key={line}>{line}</span>)}
          </span>
        </div>

        <p className="hero-role">{portfolio.role}</p>
        <div className="hero-introduction">
          <span className="intro-rule" aria-hidden="true" />
          <p className="hero-description">
            {portfolio.introduction}{' '}{portfolio.description}
          </p>
        </div>

        <div className="hero-actions">
          <a href="#contact" data-guide="contact" className="hero-button hero-button-primary">
            <Mail size={16} /> Get in Touch
          </a>
          <button type="button" data-guide="resume" className="hero-button hero-button-outline" aria-disabled="true" title="Resume coming soon" aria-label="View resume (coming soon)">
            <FileText size={16} /> View Resume
          </button>
        </div>

        <div className="hero-signature eyebrow" aria-hidden="true">
          <GraphicMark variant="chevrons" /> LOGIC MEETS CURIOSITY.
        </div>
      </div>

      <div className="portrait-art">
        <div className="portrait-cross portrait-cross-top" aria-hidden="true"><GraphicMark variant="registration" /></div>
        <span className="portrait-index eyebrow" aria-hidden="true">PORTRAIT / 01</span>
        <span className="portrait-serial" aria-hidden="true">JAC—01 / DESIGN + DEVELOPMENT</span>
        {desktopPortrait && <PortraitReveal />}
        <div className="portrait-data" aria-hidden="true"><span className="barcode" /><span className="eyebrow">JAZTIN ABRAM CONTRERAS<br />PERSONAL EDITION / 2026</span></div>
        <div className="portrait-caption" aria-hidden="true">
          <span className="eyebrow">DESIGN. DEVELOP. CREATE.</span>
          <GraphicMark variant="connection" />
        </div>
      </div>

      <div className="hero-foot">
        <a href="#projects" className="eyebrow scroll-cue"><ArrowDown size={14} /> SCROLL TO EXPLORE</a>
        <span className="eyebrow hero-foot-right">THOUGHTFUL DESIGN <span className="red">✳</span> PURPOSEFUL CODE</span>
      </div>
      <HeroGuide />
    </section>
  )
}
