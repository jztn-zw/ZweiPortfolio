import { useId, useState } from 'react'
import './StackIllustration.css'

export default function StackIllustration() {
  const id = useId().replace(/:/g, '')
  const [playing, setPlaying] = useState(false)

  return (
    <button
      type="button"
      className="stack-illustration"
      aria-label="Animate the connected technology stack"
      aria-pressed={playing}
      onClick={() => setPlaying(value => !value)}
      onKeyDown={event => { if (event.key === 'Escape') setPlaying(false) }}
    >
      <svg viewBox="0 0 480 220" fill="none" aria-hidden="true">
        <defs>
          <pattern id={`${id}-grid`} width="18" height="18" patternUnits="userSpaceOnUse">
            <path d="M18 0H0v18" stroke="var(--stack-line)" strokeOpacity=".22" strokeWidth=".5" />
          </pattern>
          <linearGradient id={`${id}-panel`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop stopColor="var(--stack-panel-top)" /><stop offset="1" stopColor="var(--stack-panel)" />
          </linearGradient>
        </defs>

        <path d="M0 0h480v220H0z" fill={`url(#${id}-grid)`} />
        <g stroke="var(--stack-muted)" strokeWidth=".7" opacity=".6">
          <path d="M22 42V24h18m400 0h18v18M22 178v18h18m400 0h18v-18" />
          <path d="M235 20h10m-5-5v10M235 196h10m-5-5v10" />
        </g>
        <text className="stack-art-type" x="34" y="38">SYSTEM / 01</text>
        <g className="stack-platform">
          <path d="m38 155 202-45 202 45-202 45Z" fill="var(--stack-platform)" stroke="var(--stack-line)" />
          <path d="m38 155 202 45 202-45v7l-202 45-202-45Z" fill="var(--stack-panel)" stroke="var(--stack-line)" strokeWidth=".6" />
          <path d="m67 155 173 38 173-38M240 119v74" stroke="var(--stack-line)" strokeWidth=".6" strokeDasharray="2 5" />
        </g>

        <path className="stack-circuit-base" d="M127 121v30h72l41-29 41 29h72v-35" />
        <path className="stack-circuit-lit" d="M127 121v30h72l41-29 41 29h72v-35" />
        <path className="stack-circuit-signal" d="M127 121v30h72l41-29 41 29h72v-35" pathLength="100" />
        <g className="stack-ports" fill="var(--stack-panel)" stroke="var(--stack-accent)">
          <circle cx="127" cy="151" r="3" /><circle cx="199" cy="151" r="3" />
          <circle cx="281" cy="151" r="3" /><circle cx="353" cy="151" r="3" />
        </g>

        <g className="stack-module stack-module--interface">
          <path className="stack-module-shadow" d="m67 136 85-10 21 10-85 12Z" />
          <g transform="rotate(-5 114 94)">
            <rect x="61" y="53" width="111" height="80" rx="4" fill={`url(#${id}-panel)`} stroke="var(--stack-edge)" />
            <path d="M62 68h109" stroke="var(--stack-line)" />
            <g fill="var(--stack-muted)"><circle cx="69" cy="61" r="1.5" /><circle cx="75" cy="61" r="1.5" /><circle cx="81" cy="61" r="1.5" /></g>
            <path d="M135 61h26" stroke="var(--stack-line)" strokeWidth="2" />
            <rect x="68" y="75" width="97" height="50" rx="1" fill="var(--stack-inset)" />
            <path d="M91 75v50" stroke="var(--stack-line)" strokeWidth=".6" />
            <path d="M74 84h10" stroke="var(--stack-accent)" strokeWidth="3" />
            <path d="M74 93h10m-10 6h7m-7 6h9" stroke="var(--stack-muted)" strokeWidth="1.3" />
            <path d="M99 83h26m-26 5h17" stroke="var(--stack-ink)" strokeWidth="2" />
            <path d="m145 82-4 5 4 5m9-10 4 5-4 5m-4-12-2 14" stroke="var(--stack-accent)" strokeWidth="1.2" />
            <g className="stack-interface-bars" fill="var(--stack-line)">
              <rect x="99" y="100" width="28" height="17" rx="1" /><rect x="132" y="100" width="26" height="17" rx="1" />
            </g>
            <path className="stack-interface-scan" d="M99 100h59" stroke="var(--stack-accent)" strokeWidth="1" />
          </g>
        </g>

        <g className="stack-core">
          <ellipse cx="240" cy="154" rx="35" ry="9" fill="var(--stack-shadow)" opacity=".25" />
          <g className="stack-core-lift">
            <circle className="stack-core-halo" cx="240" cy="105" r="37" stroke="var(--stack-accent)" strokeWidth=".7" />
            <g className="stack-core-orbit" stroke="var(--stack-accent)" strokeWidth="1.6">
              <path d="M240 66a39 39 0 0 1 34 19m0 40a39 39 0 0 1-34 19m-34-19a39 39 0 0 1 0-40" />
            </g>
            <path d="m240 77 25 14v29l-25 14-25-14V91Z" fill="var(--stack-core-fill)" stroke="var(--stack-accent)" strokeWidth="1.2" />
            <path d="m215 91 25 14 25-14m-25 14v29" stroke="var(--stack-accent)" strokeWidth="1.2" />
            <path d="m228 91 12-7 12 7-12 7Z" fill="var(--stack-accent)" fillOpacity=".4" />
            <path d="m224 108 9 5v10l-9-5Zm23 5 9-5v10l-9 5Z" fill="var(--stack-accent)" fillOpacity=".22" />
            <circle className="stack-core-status" cx="240" cy="73" r="2.5" fill="var(--stack-accent)" />
          </g>
        </g>

        <g className="stack-module stack-module--server">
          <path className="stack-module-shadow" d="m310 137 80-9 23 10-80 12Z" />
          <g transform="rotate(5 360 93)">
            <rect x="313" y="48" width="96" height="88" rx="4" fill={`url(#${id}-panel)`} stroke="var(--stack-edge)" />
            <path d="M324 61h33" stroke="var(--stack-ink)" strokeWidth="2" />
            {[72, 91, 110].map((y, index) => (
              <g key={y} className={`stack-server-bay stack-server-bay--${index}`}>
                <rect x="322" y={y} width="78" height="15" rx="1.5" fill="var(--stack-inset)" stroke="var(--stack-line)" strokeWidth=".7" />
                <path d={`M329 ${y + 6}h24m-24 4h16`} stroke="var(--stack-muted)" strokeWidth="1.2" />
                <circle className="stack-server-led" cx="390" cy={y + 7.5} r="2" fill="var(--stack-accent)" />
              </g>
            ))}
          </g>
        </g>

        <g className="stack-art-type stack-module-labels" textAnchor="middle">
          <text x="116" y="171">01 / INTERFACE</text><text x="240" y="177">02 / PROCESS</text><text x="362" y="171">03 / SYSTEM</text>
        </g>
        <g className="stack-art-type">
          <circle className="stack-footer-status" cx="37" cy="208" r="2" fill="var(--stack-accent)" />
          <text className="stack-hint-idle" x="46" y="210">HOVER / TAP TO CONNECT</text>
          <text className="stack-hint-active" x="46" y="210">CONNECTED. IDEAS TO OUTPUT.</text>
          <path d="m420 205 4 3-4 3m7-6 4 3-4 3m7-6 4 3-4 3" stroke="var(--stack-accent)" strokeWidth="1.1" />
        </g>
      </svg>
    </button>
  )
}
