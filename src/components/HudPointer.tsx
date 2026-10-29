import './HudPointer.css'

export default function HudPointer() {
  return <svg className="hud-pointer" viewBox="0 0 80 80" fill="none" focusable="false" aria-hidden="true">
    <circle cx="40" cy="40" r="29" className="hud-pointer-hairline" />
    <g className="hud-pointer-segments">
      <circle cx="40" cy="40" r="33" stroke="currentColor" strokeWidth="2.4" strokeDasharray="40 12 18 10 32 17 18 60" />
      <path d="M40 3v7m37 30h-7M40 77v-7M3 40h7" className="hud-pointer-hairline" />
    </g>
    <g className="hud-pointer-inner">
      <circle cx="40" cy="40" r="21" stroke="currentColor" strokeWidth="1.4" strokeDasharray="27 12 17 10" />
      <path d="M40 26v7m0 14v7M26 40h7m14 0h7" className="hud-pointer-hairline" />
    </g>
    <circle cx="40" cy="40" r="3" fill="currentColor" />
    <path d="M60 14h5v5h-5ZM13 59h4v4h-4Z" fill="currentColor" />
    <path d="m64 61 5 5m-3-7 5 5M10 18h6m-3-3v6" className="hud-pointer-hairline" />
  </svg>
}
