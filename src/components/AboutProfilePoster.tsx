import { portfolio } from '../data/portfolio'
import { aboutPortraitOutline } from '../lib/aboutPortraitOutline'
import GraphicMark from './GraphicMark'
import './AboutProfilePoster.css'

export default function AboutProfilePoster() {
  return (
    <figure className="about-profile-poster profile-cover">
      <div className="profile-cover-top eyebrow" aria-hidden="true">
        <span>PROFILE / 04</span>
        <GraphicMark variant="signal" />
      </div>

      <div className="profile-cover-scene">
        <svg className="profile-cover-mask" width="0" height="0" aria-hidden="true" focusable="false">
          <defs>
            <clipPath id="about-profile-subject" clipPathUnits="objectBoundingBox">
              <path d={aboutPortraitOutline} />
            </clipPath>
          </defs>
        </svg>
        <span className="profile-cover-title" aria-hidden="true">JAZTIN</span>
        <span className="profile-cover-axis" aria-hidden="true" />
        <img
          className="profile-cover-portrait"
          src="/images/jaztin-about-editorial.webp"
          alt="Jaztin Abram Contreras wearing his cap, glasses and plaid cardigan, with his hands in his pockets"
          width="1024"
          height="1536"
          loading="lazy"
          decoding="async"
        />
        <span className="profile-cover-caption eyebrow" aria-hidden="true">CURIOUS BY NATURE.</span>
        <span className="profile-cover-edition eyebrow" aria-hidden="true">PERSONAL EDITION / 2026</span>
      </div>

      <div className="profile-cover-studies" aria-hidden="true">
        {[0, 1, 2].map(index => (
          <div className={`profile-cover-study profile-cover-study--${index + 1}`} key={index}>
            <div className="profile-cover-study-art">
              <img src="/images/jaztin-profile-studies.webp" alt="" width="2172" height="724" loading="lazy" decoding="async" />
            </div>
            <span>0{index + 1}</span>
          </div>
        ))}
      </div>

      <figcaption className="profile-cover-nameplate">
        <div><p>{portfolio.name}</p><span className="eyebrow">{portfolio.role}</span></div>
        <GraphicMark variant="globe" />
      </figcaption>
    </figure>
  )
}
