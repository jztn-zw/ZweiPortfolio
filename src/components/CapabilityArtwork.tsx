import { useId } from 'react'
import './CapabilityArtwork.css'

type CapabilityArtworkProps = { variant: 'web' | 'mobile' | 'fullstack' | 'automation' }

export default function CapabilityArtwork({ variant }: CapabilityArtworkProps) {
  const id = useId().replace(/:/g, '')
  const surface = id + '-surface'
  const grid = id + '-grid'

  return (
    <svg viewBox="0 0 320 210" fill="none" aria-hidden="true" className={'capability-artwork capability-artwork--' + variant}>
      <defs>
        <linearGradient id={surface} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop stopColor="var(--cap-shell-top)" /><stop offset="1" stopColor="var(--cap-shell-bottom)" />
        </linearGradient>
        <pattern id={grid} width="16" height="16" patternUnits="userSpaceOnUse">
          <path d="M16 0H0v16" stroke="var(--cap-grid)" strokeOpacity=".11" strokeWidth=".5" />
        </pattern>
      </defs>
      <path fill={'url(#' + grid + ')'} d="M0 0h320v210H0z" />
      <path d="M11 35v-8h8m282 0h8v8M11 177v8h8m282 0h8v-8" stroke="var(--cap-mark)" strokeWidth=".7" />
      <path d="M34 176h252" stroke="var(--cap-line)" strokeWidth=".6" opacity=".45" />

      {variant === 'web' && (
        <g className="capability-object">
          <ellipse cx="158" cy="166" rx="104" ry="8" fill="var(--cap-shadow)" opacity=".13" />
          <g className="cap-part cap-web-browser">
            <g transform="rotate(-5 137 108)">
              <rect x="46" y="57" width="192" height="109" rx="4" fill="var(--cap-rear)" stroke="var(--cap-edge-soft)" />
              <rect x="38" y="49" width="192" height="109" rx="4" fill={'url(#' + surface + ')'} stroke="var(--cap-edge)" />
              <path d="M39 65h190" stroke="var(--cap-edge-soft)" strokeWidth=".8" />
              <g fill="var(--cap-muted)"><circle cx="46" cy="57" r="1.4" /><circle cx="52" cy="57" r="1.4" /><circle cx="58" cy="57" r="1.4" /></g>
              <rect x="91" y="54" width="85" height="5" rx="2" fill="var(--cap-inset)" />
              <rect x="45" y="72" width="178" height="79" rx="1" fill="var(--cap-screen)" />
              <path d="M77 72v79" stroke="var(--cap-edge-soft)" strokeWidth=".7" />
              <path d="M52 82h16" stroke="var(--cap-accent)" strokeWidth="3" />
              <path d="M52 94h14m-14 7h10m-10 7h12" stroke="var(--cap-muted)" strokeWidth="1.5" />
              <g className="cap-part cap-web-hero">
                <rect x="86" y="79" width="128" height="37" rx="2" fill="var(--cap-panel)" stroke="var(--cap-edge-soft)" strokeWidth=".5" />
                <path d="M94 89h46m-46 6h32" stroke="var(--cap-ink)" strokeWidth="2.5" />
                <rect x="94" y="103" width="25" height="5" rx="1" fill="var(--cap-accent)" />
                <path d="m183 87-5 6 5 6m15-12 5 6-5 6m-7-15-3 18" stroke="var(--cap-accent-ink)" strokeWidth="1.5" />
              </g>
              {[86, 130, 174].map((x, index) => (
                <g key={x} className={'cap-part cap-web-card cap-web-card--' + index}>
                  <rect x={x} y="123" width="40" height="20" rx="1.5" fill="var(--cap-panel)" stroke="var(--cap-edge-soft)" strokeWidth=".5" />
                  <path d={'M' + (x + 6) + ' 130h25m-25 6h16'} stroke="var(--cap-muted)" strokeWidth="1.3" />
                  <path className="cap-web-card-line" d={'M' + (x + 6) + ' 140h28'} stroke="var(--cap-accent)" strokeWidth="1.3" />
                </g>
              ))}
            </g>
          </g>
          <g className="cap-part cap-web-phone">
            <g transform="rotate(6 245 119)">
              <rect x="223" y="78" width="46" height="85" rx="7" fill={'url(#' + surface + ')'} stroke="var(--cap-edge)" />
              <rect x="227" y="83" width="38" height="75" rx="4" fill="var(--cap-screen)" />
              <rect x="237" y="85" width="17" height="3" rx="1.5" fill="var(--cap-edge-soft)" />
              <path d="M232 96h15" stroke="var(--cap-ink)" strokeWidth="2" />
              <rect x="232" y="103" width="28" height="22" rx="2" fill="var(--cap-accent-panel)" />
              <path d="M237 110h16m-16 5h11" stroke="var(--cap-accent-ink)" strokeWidth="1.5" />
              <path d="M232 132h27m-27 6h19" stroke="var(--cap-muted)" strokeWidth="1.5" />
              <path className="cap-phone-progress" d="M232 146h27" stroke="var(--cap-accent)" strokeWidth="2" />
              <circle cx="246" cy="153" r="1.5" fill="var(--cap-muted)" />
            </g>
          </g>
          <g className="cap-connection-mark" stroke="var(--cap-accent)" strokeWidth="1.1"><path d="M252 57h15m-4-4 4 4-4 4" /><circle cx="248" cy="57" r="1" /></g>
        </g>
      )}

      {variant === 'fullstack' && (
        <g className="capability-object">
          <path d="m40 157 115-21 128 21-119 19Z" fill="var(--cap-rear)" stroke="var(--cap-edge-soft)" strokeWidth=".7" />
          <path className="cap-circuit-base" d="M134 101h28V65h49v72h17" />
          <path className="cap-circuit-lit" d="M134 101h28V65h49v72h17" />
          <path className="cap-flow cap-flow--backend" d="M134 101h28V65h49v72h17" pathLength="100" />
          <g className="cap-part cap-backend-server">
            <g transform="rotate(-5 96 105)">
              <rect x="56" y="50" width="83" height="112" rx="4" fill={'url(#' + surface + ')'} stroke="var(--cap-edge)" />
              <path d="M66 62h34" stroke="var(--cap-ink)" strokeWidth="2" />
              <path d="M119 60h9m-9 3h9" stroke="var(--cap-edge-soft)" strokeWidth="1" />
              {[72, 97, 122].map((y, index) => (
                <g key={y}>
                  <rect x="63" y={y} width="69" height="20" rx="2" fill="var(--cap-screen)" stroke="var(--cap-edge-soft)" strokeWidth=".6" />
                  <path d={'M70 ' + (y + 7) + 'h24m-24 5h16'} stroke="var(--cap-muted)" strokeWidth="1.5" />
                  <circle className={'cap-led cap-led--' + index} cx="123" cy={y + 10} r="2" fill="var(--cap-accent)" />
                </g>
              ))}
              <path d="M68 151h19m30 0h9" stroke="var(--cap-edge-soft)" strokeWidth="2" />
            </g>
          </g>
          <g className="cap-part cap-backend-core">
            <circle className="cap-core-orbit" cx="211" cy="65" r="28" stroke="var(--cap-accent)" strokeWidth=".8" strokeDasharray="18 11 4 11" />
            <rect x="192" y="46" width="38" height="38" rx="5" fill={'url(#' + surface + ')'} stroke="var(--cap-edge)" />
            <rect x="201" y="55" width="20" height="20" rx="2" fill="var(--cap-accent-panel)" stroke="var(--cap-accent)" strokeWidth=".8" />
            <path d="M205 61h12m-12 4h8m-8 4h10" stroke="var(--cap-accent-ink)" strokeWidth="1.4" />
            <path d="M200 42v4m7-4v4m8-4v4m7-4v4m-22 38v4m7-4v4m8-4v4m7-4v4M188 54h4m-4 7h4m-4 8h4m-4 7h4m38-22h4m-4 7h4m-4 8h4m-4 7h4" stroke="var(--cap-muted)" strokeWidth="1" />
          </g>
          <g className="cap-part cap-backend-database">
            <path d="M190 119v34c0 16 80 16 80 0v-34" fill={'url(#' + surface + ')'} stroke="var(--cap-edge)" />
            <ellipse cx="230" cy="119" rx="40" ry="11" fill="var(--cap-panel)" stroke="var(--cap-edge)" />
            <ellipse cx="230" cy="119" rx="29" ry="6" stroke="var(--cap-edge-soft)" strokeWidth=".7" />
            <path d="M190 131c0 15 80 15 80 0m-80 12c0 15 80 15 80 0" stroke="var(--cap-line)" strokeWidth=".8" />
            <path className="cap-db-write" d="M190 131c0 15 80 15 80 0" pathLength="100" stroke="var(--cap-accent)" strokeWidth="1.6" />
            <circle className="cap-led cap-led--database" cx="201" cy="150" r="1.7" fill="var(--cap-accent)" />
            <path d="M207 153h9" stroke="var(--cap-muted)" strokeWidth="1.5" />
          </g>
          <g fill="var(--cap-accent)"><circle cx="162" cy="101" r="2.2" /><circle cx="175" cy="65" r="1.5" /></g>
        </g>
      )}

      {variant === 'automation' && (
        <g className="capability-object">
          <path d="M54 150h213" stroke="var(--cap-edge-soft)" strokeWidth=".7" strokeDasharray="2 5" />
          <path className="cap-circuit-base" d="M96 93h28v34h37V89h60v24h18" />
          <path className="cap-circuit-lit" d="M96 93h28v34h37V89h60v24h18" />
          <path className="cap-flow cap-flow--workflow" d="M96 93h28v34h37V89h60v24h18" pathLength="100" />
          <g className="cap-part cap-workflow-input">
            <g transform="rotate(-6 75 94)">
              <rect x="38" y="64" width="74" height="61" rx="4" fill={'url(#' + surface + ')'} stroke="var(--cap-edge)" />
              <path d="M39 77h72" stroke="var(--cap-edge-soft)" strokeWidth=".7" />
              <path d="M45 71h2m3 0h2m3 0h2" stroke="var(--cap-muted)" strokeWidth="1.4" />
              <rect x="44" y="83" width="62" height="35" rx="1" fill="var(--cap-screen)" />
              <path d="m59 91-6 8 6 7m30-15 6 8-6 7m-12-18-5 21" stroke="var(--cap-accent)" strokeWidth="1.6" />
              <path className="cap-code-cursor" d="M81 110h8" stroke="var(--cap-ink)" strokeWidth="1.2" />
            </g>
          </g>
          <g className="cap-part cap-workflow-core">
            <circle cx="161" cy="111" r="35" stroke="var(--cap-edge-soft)" strokeWidth=".6" />
            <circle className="cap-core-orbit" cx="161" cy="111" r="29" stroke="var(--cap-accent)" strokeWidth="1.1" strokeDasharray="30 12 4 14" />
            <path d="m161 89 19 11v22l-19 11-19-11v-22Z" fill="var(--cap-accent-panel)" stroke="var(--cap-accent)" strokeWidth="1.1" />
            <path d="m142 100 19 11 19-11m-19 11v22" stroke="var(--cap-accent-line)" strokeWidth="1" />
            <path d="m153 100 8-5 8 5-8 5Z" fill="var(--cap-accent)" fillOpacity=".45" />
            <path className="cap-core-spark" d="m161 68 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" fill="var(--cap-ink)" />
          </g>
          <g className="cap-part cap-workflow-output">
            <g transform="rotate(5 249 109)">
              <rect x="216" y="77" width="67" height="65" rx="4" fill={'url(#' + surface + ')'} stroke="var(--cap-edge)" />
              <path d="M217 91h65" stroke="var(--cap-edge-soft)" strokeWidth=".7" />
              <path d="M223 84h19" stroke="var(--cap-muted)" strokeWidth="1.4" />
              <path d="M229 114h13l9-12h16m-25 12 9 12h16" stroke="var(--cap-accent)" strokeWidth="1.4" />
              <g fill="var(--cap-screen)" stroke="var(--cap-accent)" strokeWidth="1.2"><circle cx="229" cy="114" r="3" /><circle cx="251" cy="102" r="3" /><circle cx="267" cy="102" r="3" /><circle cx="251" cy="126" r="3" /><circle cx="267" cy="126" r="3" /></g>
              <circle className="cap-output-status" cx="271" cy="84" r="2" fill="var(--cap-accent)" />
            </g>
          </g>
          <g className="cap-workflow-progress">
            <path d="M87 161h145" stroke="var(--cap-edge-soft)" strokeWidth="1" />
            {[87, 160, 232].map((x, index) => <g key={x}><circle cx={x} cy="161" r="4" fill="var(--cap-screen)" stroke="var(--cap-line)" /><path className={'cap-stage-check cap-stage-check--' + index} d={'m' + (x - 2) + ' 161 1.5 1.5 3-3'} pathLength="1" stroke="var(--cap-accent)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></g>)}
          </g>
        </g>
      )}

      {variant === 'mobile' && (
        <g className="capability-object">
          {[105, 175].map((x, index) => <g className={'cap-part cap-mobile-device cap-mobile-device--' + index} key={x}><rect x={x - 31} y="43" width="62" height="125" rx="9" fill={'url(#' + surface + ')'} stroke="var(--cap-edge)" /><rect x={x - 26} y="50" width="52" height="110" rx="5" fill="var(--cap-screen)" /><path d={'M' + (x - 10) + ' 56h20'} stroke="var(--cap-edge-soft)" strokeWidth="3" /><rect x={x - 20} y="73" width="40" height="37" rx="3" fill="var(--cap-accent-panel)" /><path d={'M' + (x - 15) + ' 84h25m-25 7h17m-17 34h30m-30 8h22'} stroke="var(--cap-muted)" strokeWidth="2" /></g>)}
        </g>
      )}
    </svg>
  )
}
