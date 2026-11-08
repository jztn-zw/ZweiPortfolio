import { useId } from 'react'
import GraphicMark from './GraphicMark'

export default function JourneyGraphic() {
  const id = useId().replace(/:/g, '')

  return (
    <div className="journey-graphic" aria-hidden="true">
      <div className="journey-graphic-top eyebrow"><span>DESIGN → DEVELOPMENT</span><span className="detail-dot-matrix" /></div>
      <svg className="journey-foundation" viewBox="0 0 380 280" fill="none">
        <defs>
          <linearGradient id={`${id}-plate`} x1="0" y1="0" x2="140" y2="140" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--foundation-plate-top, #454541)" /><stop offset="1" stopColor="var(--foundation-plate-bottom, #232322)" />
          </linearGradient>
          <linearGradient id={`${id}-crimson`} x1="0" y1="0" x2="140" y2="140" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--foundation-accent-top, #a83c40)" /><stop offset="1" stopColor="var(--foundation-accent-bottom, #492124)" />
          </linearGradient>
          <filter id={`${id}-depth`} x="-40%" y="-50%" width="180%" height="220%">
            <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="var(--foundation-shadow, #000)" floodOpacity="var(--foundation-shadow-opacity, .45)" />
          </filter>
          <clipPath id={`${id}-scan`}><rect x="27" y="27" width="86" height="86" /></clipPath>
        </defs>
        <path d="M180 16v248" stroke="#74746b" strokeOpacity=".28" strokeDasharray="2 5" />
        <ellipse className="foundation-shadow" cx="180" cy="246" rx="115" ry="18" fill="var(--foundation-shadow, #000)" fillOpacity=".18" />
        <path d="M32 55V40h15m286 0h15v15M32 224v15h15m286 0h15v-15" stroke="#626259" strokeOpacity=".45" />
        <path className="foundation-signal" d="M180 22v218" pathLength="100" stroke="var(--foundation-accent, #d1363a)" strokeWidth="2" strokeDasharray="7 93" strokeLinecap="round" />

        <g className="foundation-layer foundation-layer--build" filter={`url(#${id}-depth)`}>
          <path d="m68 184 112 56 112-56v7l-112 56-112-56Z" fill="var(--foundation-build-side, #393936)" stroke="var(--foundation-edge, #74746a)" strokeWidth=".7" />
          <g transform="matrix(.8 .4 -.8 .4 180 128)">
            <rect width="140" height="140" rx="2" fill={`url(#${id}-plate)`} stroke="var(--foundation-edge-bright, #aca99a)" strokeWidth="1.1" />
            <rect x="13" y="13" width="114" height="114" rx="2" fill="var(--foundation-inset, #1c1c1b)" stroke="var(--foundation-line, #67675e)" strokeWidth=".8" />
            <path d="M13 32h114" stroke="var(--foundation-line, #67675e)" />
            <path d="M23 22h2m6 0h2m6 0h2" stroke="var(--foundation-muted, #a6a496)" strokeWidth="3" />
            <path d="m45 54-13 16 13 16m50-32 13 16-13 16M77 48 63 93" stroke="var(--foundation-ink, #d8c5b9)" strokeWidth="3" />
            <path d="M32 109h49m7 0h20" stroke="var(--foundation-accent-detail, #b7474b)" strokeWidth="3" />
          </g>
        </g>

        <g className="foundation-layer foundation-layer--learn" filter={`url(#${id}-depth)`}>
          <path d="m68 130 112 56 112-56v6l-112 56-112-56Z" fill="var(--foundation-accent-side, #4f2326)" stroke="var(--foundation-accent-edge, #c25155)" strokeWidth=".7" />
          <g transform="matrix(.8 .4 -.8 .4 180 74)">
            <rect width="140" height="140" rx="2" fill={`url(#${id}-crimson)`} stroke="var(--foundation-accent-bright, #e0797b)" strokeWidth="1.2" />
            <path d="M14 14h112v112H14z" stroke="var(--foundation-accent-soft, #e2ada3)" strokeOpacity=".28" />
            <circle cx="70" cy="70" r="40" stroke="var(--foundation-accent-ink, #eac5b7)" strokeWidth="1.5" />
            <circle cx="70" cy="70" r="27" stroke="var(--foundation-accent-ink, #eac5b7)" strokeOpacity=".4" />
            <g className="foundation-orbit">
              <circle cx="70" cy="70" r="46" stroke="var(--foundation-accent-ink-bright, #edcdc0)" strokeWidth="1.6" strokeDasharray="25 120" />
              <circle cx="116" cy="70" r="2.5" fill="var(--foundation-accent-ink-bright, #edcdc0)" />
            </g>
            <path d="M70 23v17m0 60v17M23 70h17m60 0h17" stroke="var(--foundation-accent-ink-bright, #edcdc0)" strokeWidth="1.5" />
            <path d="m70 51 19 19-19 19-19-19Z" fill="var(--foundation-accent-fill, #e5c8bb)" />
            <path d="m70 61 9 9-9 9-9-9Z" fill="var(--foundation-accent-core, #9a3c40)" />
            <circle cx="14" cy="14" r="2" fill="var(--foundation-accent-fill, #e5c8bb)" /><circle cx="126" cy="126" r="2" fill="var(--foundation-accent-fill, #e5c8bb)" />
          </g>
        </g>

        <g className="foundation-layer foundation-layer--design" filter={`url(#${id}-depth)`}>
          <path d="m68 76 112 56 112-56v6l-112 56L68 82Z" fill="var(--foundation-design-side, #30302e)" stroke="var(--foundation-edge, #77776d)" strokeWidth=".7" />
          <g transform="matrix(.8 .4 -.8 .4 180 20)">
            <rect width="140" height="140" rx="2" fill={`url(#${id}-plate)`} stroke="var(--foundation-edge-bright, #c0beae)" strokeWidth="1.2" />
            <g stroke="var(--foundation-grid, #c3c1ae)" strokeOpacity=".15" strokeWidth=".8">
              {[28, 56, 84, 112].map(n => <path key={n} d={`M${n} 0v140M0 ${n}h140`} />)}
            </g>
            <rect x="27" y="27" width="86" height="86" stroke="var(--foundation-edge-bright, #c5c2b1)" strokeWidth="1.2" />
            <rect x="38" y="38" width="31" height="64" fill="var(--foundation-muted, #9c9b8b)" fillOpacity=".28" />
            <path d="M79 40h22m-22 9h16M79 66h22m-22 9h22m-22 9h14" stroke="var(--foundation-ink, #bbb8a6)" strokeWidth="2" />
            <path d="m80 100 10-10 11 10Z" fill="var(--foundation-accent-detail, #b7474b)" />
            <g clipPath={`url(#${id}-scan)`}>
              <g className="foundation-scan">
                <rect x="27" y="27" width="86" height="13" fill="var(--foundation-accent-ink, #eac5b7)" fillOpacity=".08" />
                <path d="M27 40h86" stroke="var(--foundation-accent-bright, #d77a7b)" strokeWidth="1.5" />
              </g>
            </g>
            {[[27, 27], [113, 27], [27, 113], [113, 113]].map(([x, y], index) => <rect className={`foundation-node foundation-node--${index}`} key={`${x}-${y}`} x={x - 3} y={y - 3} width="6" height="6" fill="var(--foundation-accent, #d1363a)" stroke="var(--foundation-accent-soft, #e0a39c)" strokeWidth=".7" />)}
          </g>
        </g>

        <g fill="#b7b4a4" fontFamily="Consolas, monospace" fontSize="16" letterSpacing=".3">
          <g className="foundation-layer foundation-layer--design"><path d="M292 76h15" stroke="#868476" strokeWidth=".7" /><text x="312" y="78">DESIGN</text></g>
          <g className="foundation-layer foundation-layer--learn"><path d="M292 130h15" stroke="#868476" strokeWidth=".7" /><text x="312" y="132">LEARN</text></g>
          <g className="foundation-layer foundation-layer--build"><path d="M292 184h15" stroke="#868476" strokeWidth=".7" /><text x="312" y="186">BUILD</text></g>
        </g>
        <circle className="foundation-layer foundation-layer--design" cx="180" cy="20" r="2.5" fill="var(--foundation-accent, #d1363a)" />
        <path d="M74 258h212" stroke="#6d6b5e" strokeOpacity=".35" strokeWidth=".7" />
        <path d="M74 255v6m212-6v6" stroke="#a8a493" strokeWidth=".8" />
      </svg>
<div className="journey-graphic-type">A CREATIVE<br />FOUNDATION</div>
      <div className="journey-graphic-bottom eyebrow"><GraphicMark variant="chevrons" /><span>ALWAYS LEARNING.<br />ALWAYS BUILDING.</span></div>
    </div>
  )
}

