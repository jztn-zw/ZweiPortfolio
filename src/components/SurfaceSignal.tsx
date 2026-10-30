import './SurfaceSignal.css'

export type SignalKind = 'compile' | 'timeline' | 'metric' | 'feature' | 'system' | 'arsenal' | 'product'

const routes: Record<SignalKind, string> = {
  compile: 'M5 27H82L97 12H206L221 27H473',
  timeline: 'M8 25H232',
  metric: 'M7 27a16 16 0 1 1 29 0',
  feature: 'M8 28H62L76 14H148L162 28H232',
  system: 'M8 12H100L112 25H202L214 12H352',
  arsenal: '',
  product: 'M8 26H43L54 15H94L105 26H152',
}
const widths: Record<SignalKind, number> = { compile: 480, timeline: 240, metric: 120, feature: 240, system: 360, arsenal: 180, product: 160 }

function RailDetails({ kind }: { kind: SignalKind }) {
  if (kind === 'compile') return <>
    <path className="surface-hud-guide" d={routes.compile} transform="translate(0 7)" />
    <g className="surface-hud-plates" fill="currentColor" stroke="none">
      <path d="m105 8 43 0-7 7h-43Zm131 17h24l-7 7h-24Z" />
      {Array.from({ length: 4 }, (_, index) => <path key={index} d={`m${304 + index * 16} 15h10l-9 12h-10Z`} />)}
    </g>
    <g className="surface-hud-nodes"><circle cx="5" cy="27" r="2.5" /><circle cx="473" cy="27" r="2.5" /><path d="M19 12h26m381 0h27m-27 4h16" /></g>
  </>
  if (kind === 'timeline') return <>
    <path className="surface-hud-guide" d="M24 33h70l8 4h42l8-4h64M6 17v-5h15m198 0h15v5" />
    <g className="surface-hud-nodes surface-timeline-ticks">
      {Array.from({ length: 17 }, (_, index) => {
        const x = 24 + index * 12
        return <path className="surface-timeline-tick" key={x} d={`M${x} ${index % 4 === 0 ? 17 : 21}V29`} />
      })}
      <circle className="surface-timeline-end" cx="8" cy="25" r="3" />
      <circle className="surface-timeline-end" cx="232" cy="25" r="3" />
    </g>
    <g className="surface-timeline-traveler">
      <path d="m0 21 4 4-4 4-4-4Z" fill="currentColor" strokeWidth=".6" />
      <circle cy="25" r="1" fill="var(--theme-text, #eae7da)" stroke="none" />
    </g>
  </>
  if (kind === 'metric') return <>
    <path className="surface-hud-guide" d="M3 29a20 20 0 1 1 36 0M47 12h18m-18 9h30m-30 9h48" />
    <path className="surface-hud-plates" d="m19 22 8-11-3 13Z" fill="currentColor" stroke="none" />
    <circle cx="22" cy="23" r="2" fill="currentColor" />
  </>
  if (kind === 'feature') return <g className="surface-hud-nodes">
    <circle cx="8" cy="28" r="3" /><circle cx="111" cy="14" r="3" fill="currentColor" /><circle cx="232" cy="28" r="3" /><path d="M88 8h15m22 0h9" />
  </g>
  if (kind === 'system') return <>
    <path className="surface-hud-guide" d={routes.system} transform="translate(0 6)" />
    <g className="surface-hud-nodes"><path d="M145 15v17m8-17v17m8-17v17M8 8v8m344-8v8" /><path d="M268 7h18m6 0h7" /></g>
  </>
  return <g className="surface-hud-plates" fill="currentColor" stroke="none"><path d="m59 4 7 7-7 7h-5l7-7-7-7Zm15 0 7 7-7 7h-5l7-7-7-7ZM119 23h4v4h-4Zm7 0h4v4h-4Z" /></g>
}

// Purely decorative. Timeline loops only while active; other routes draw once per entry.
export default function SurfaceSignal({ kind }: { kind: SignalKind }) {
  return <span className={`surface-signal surface-signal--${kind}`} aria-hidden="true">
    {kind === 'arsenal' && <svg className="surface-signal-frame" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none" focusable="false">
      <path className="surface-signal-wire" d="M84 3H97V16M16 97H3V84" pathLength="1" vectorEffect="non-scaling-stroke" />
    </svg>}
    {kind !== 'arsenal' && <svg className="surface-signal-route" viewBox={`0 0 ${widths[kind]} 42`} fill="none" focusable="false">
      <path className="surface-signal-wire" d={routes[kind]} pathLength="1" vectorEffect="non-scaling-stroke" />
      {['compile', 'feature', 'system'].includes(kind) && <path className="surface-signal-packet" d={routes[kind]} pathLength="1" vectorEffect="non-scaling-stroke" />}
      <RailDetails kind={kind} />
    </svg>}
    {kind === 'product' && <span className="surface-signal-sweep" />}
  </span>
}
