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

function DetailSchematic({ kind }: { kind: (typeof aboutMe.details)[number]['id'] }) {
  return <svg className={`about-detail-schematic about-detail-schematic--${kind}`} viewBox="0 0 64 20" fill="none" aria-hidden="true" focusable="false">
    {kind === 'location' && <>
      <path className="detail-schematic-guide" d="M5 15h14L30 5h16l10 10h3" />
      <path className="detail-schematic-flow" d="M5 15h14L30 5h16l10 10h3" pathLength="1" />
      <circle cx="5" cy="15" r="2" /><circle cx="59" cy="15" r="2" />
    </>}
    {kind === 'currently' && <>
      <path className="detail-schematic-guide" d="M5 17h54M8 13V8h11v5m8 0V5h11v8m8 0V2h11v11" />
      <g className="detail-schematic-steps"><path d="M10 11h7" /><path d="M29 11h7m-7-3h7" /><path d="M48 11h7m-7-3h7m-7-3h7" /></g>
    </>}
    {kind === 'focus' && <>
      <path className="detail-schematic-guide" d="m14 4-7 6 7 6m36-12 7 6-7 6M22 10h20" />
      <path className="detail-schematic-flow" d="M22 10h20" pathLength="1" />
      <path d="m34 4-4 12" />
    </>}
    {kind === 'interests' && <>
      <path className="detail-schematic-guide" d="M5 10h16m26 0h12M25 10a9 9 0 0 1 18 0 9 9 0 0 1-18 0" />
      <g className="detail-schematic-orbit"><path d="m34 3 7 7-7 7-7-7Z" /><circle cx="34" cy="3" r="1.5" /><circle cx="34" cy="17" r="1.5" /></g>
      <circle cx="34" cy="10" r="1.5" />
    </>}
  </svg>
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
            <span className="about-details-signal" aria-hidden="true">
              <svg viewBox="0 0 128 30" fill="none" focusable="false">
                <path className="details-signal-guide" d="M4 15h25l11-9h18m12 18h18l11-9h25M16 24h19m58-18h19" />
                <path className="details-signal-route" d="M4 15h28l12 9h12m16-18h12l12 9h28" pathLength="1" />
                <path className="details-signal-packet" d="M4 15h28l12 9h12m16-18h12l12 9h28" pathLength="1" />
                <g className="details-signal-core">
                  <path d="M59 4h-5v7m15-7h5v7m0 8v7h-5m-10 0h-5v-7" />
                  <path d="m64 9 6 6-6 6-6-6Z" fill="currentColor" stroke="none" />
                </g>
                <g className="details-signal-terminals"><circle cx="4" cy="15" r="2" /><circle cx="124" cy="15" r="2" /></g>
              </svg>
            </span>
            <span className="eyebrow" aria-hidden="true">A LITTLE MORE CONTEXT</span>
          </div>
          <dl className="about-me-details-grid">
            {aboutMe.details.map(detail => {
              const Icon = detailIcons[detail.id]
              return (
                <div className={`about-me-detail about-me-detail--${detail.id}`} key={detail.id}>
                  <dt><span className="about-me-detail-icon" aria-hidden="true"><Icon size={18} strokeWidth={1.5} /></span><span>{detail.label}</span><DetailSchematic kind={detail.id} /></dt>
                  <dd>{detail.id === 'interests' ? (
                    <ul className="about-me-interests">{detail.value.split(' • ').map(interest => <li key={interest}>{interest}</li>)}</ul>
                  ) : detail.value}</dd>
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
