import { ArrowUpRight, CodeXml, Compass, GraduationCap, MapPin } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { aboutMe } from '../data/portfolio'
import { aboutPortraitOutline } from '../lib/aboutPortraitOutline'
import SectionHeading from './SectionHeading'
import GraphicMark from './GraphicMark'
import AboutProfilePoster from './AboutProfilePoster'
import './AboutSection.css'

const detailIcons: Record<(typeof aboutMe.details)[number]['id'], LucideIcon> = {
  location: MapPin,
  currently: GraduationCap,
  focus: CodeXml,
  interests: Compass,
}

export default function AboutSection() {
  return (
    <section id="about" className="about-me-section" aria-labelledby="about-me-title">
      <div className="about-me-mobile-portrait" aria-hidden="true">
        <svg className="about-me-backdrop-mask" width="0" height="0" focusable="false">
          <defs><clipPath id="about-mobile-portrait-subject" clipPathUnits="objectBoundingBox"><path d={aboutPortraitOutline} /></clipPath></defs>
        </svg>
        <img src="/images/jaztin-about-editorial.webp" alt="" width="1024" height="1536" loading="lazy" decoding="async" />
      </div>
      <div className="page-width about-me-inner">
        <div className="about-me-heading">
          <SectionHeading number="04" label="ABOUT ME">
            <span id="about-me-title">BEYOND THE CODE<span className="red">.</span></span>
          </SectionHeading>
          <span className="about-me-who eyebrow">WHO I AM <GraphicMark variant="globe" /></span>
        </div>

        <div className="about-me-story">
          <AboutProfilePoster />

          <div className="about-me-copy">
            <blockquote className="about-me-quote"><p>“{aboutMe.quote}”</p></blockquote>
            <div className="about-me-biography">
              <p>{aboutMe.introduction}</p>
              <p>My focus is on <strong>{aboutMe.focus}</strong>. {aboutMe.exploration}</p>
              <p>{aboutMe.learning}</p>
            </div>
            <div className="about-me-copy-signoff" aria-hidden="true"><GraphicMark variant="contour" /><span className="eyebrow">CURIOUS ABOUT THE WHY.<br />FOCUSED ON THE HOW.</span></div>
          </div>
        </div>

        <div className="about-me-details">
          <div className="about-me-details-heading">
            <h3>Quick Details</h3>
            <span className="eyebrow" aria-hidden="true">A LITTLE MORE CONTEXT <span className="red">↘</span></span>
          </div>
          <dl className="about-me-details-grid">
            {aboutMe.details.map(detail => {
              const Icon = detailIcons[detail.id]
              return (
                <div className={`about-me-detail about-me-detail--${detail.id}`} key={detail.id}>
                  <dt><Icon size={16} strokeWidth={1.5} aria-hidden="true" /><span>{detail.label}</span></dt>
                  <dd>{detail.value}</dd>
                </div>
              )
            })}
          </dl>
        </div>

        <div className="about-me-footer">
          <GraphicMark variant="connection" />
          <a href="#contact">Let’s connect <ArrowUpRight size={18} /></a>
        </div>
      </div>
    </section>
  )
}
