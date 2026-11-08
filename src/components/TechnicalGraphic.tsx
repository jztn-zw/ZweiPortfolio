import GraphicMark from './GraphicMark'

export default function TechnicalGraphic() {
  return (
    <div className="technical-graphic" aria-hidden="true">
      <div className="technical-graphic-top eyebrow"><span>FIG. 03 / THE HUMAN SIDE</span><GraphicMark variant="signal" /></div>
      <svg className="human-orbit" viewBox="0 0 440 340" fill="none">
        <g stroke="currentColor" strokeWidth="1">
          <ellipse cx="220" cy="170" rx="158" ry="108" />
          <ellipse cx="220" cy="170" rx="158" ry="56" />
          <ellipse cx="220" cy="170" rx="158" ry="18" />
          <ellipse cx="220" cy="170" rx="96" ry="108" />
          <ellipse cx="220" cy="170" rx="39" ry="108" />
          <path d="M62 170h316M220 62v216" />
          <ellipse cx="220" cy="170" rx="186" ry="43" transform="rotate(-32 220 170)" className="human-orbit-track" />
        </g>
        <g className="human-orbit-nodes" fill="currentColor">
          <circle cx="62" cy="170" r="4" /><circle cx="220" cy="62" r="4" /><circle cx="350" cy="89" r="6" />
        </g>
        <path d="M24 42V24h18M398 24h18v18M416 298v18h-18M42 316H24v-18" stroke="currentColor" strokeWidth="2" />
      </svg>
<div className="human-diagram-type"><span>CURIOUS</span><span>BY DESIGN</span></div>
      <div className="technical-graphic-bottom"><span className="detail-dot-matrix" /><span className="eyebrow">MORE THAN A<br />LINE OF CODE.</span><span className="diagram-number">03</span></div>
    </div>
  )
}
