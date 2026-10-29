import './GraphicMark.css'

export type GraphicMarkVariant = 'orbit' | 'globe' | 'chevrons' | 'registration' | 'weave' | 'signal' | 'contour' | 'modules' | 'connection'

type GraphicMarkProps = { variant: GraphicMarkVariant; className?: string }

// Original decorative linework: shared visual language, distinct silhouettes.
export default function GraphicMark({ variant, className = '' }: GraphicMarkProps) {
  const square = variant === 'globe' || variant === 'registration' || variant === 'contour'
  return (
    <svg className={`graphic-mark graphic-mark--${variant} ${className}`} viewBox={square ? '0 0 48 48' : '0 0 96 48'} fill="none" aria-hidden="true" focusable="false">
      {variant === 'orbit' && <>
        <g stroke="currentColor" strokeWidth=".8">
          <ellipse cx="48" cy="24" rx="37" ry="13" transform="rotate(-17 48 24)" />
          <ellipse cx="48" cy="24" rx="27" ry="13" transform="rotate(-17 48 24)" />
          <ellipse cx="48" cy="24" rx="15" ry="13" transform="rotate(-17 48 24)" />
          <path d="m9 36 78-24M12 40l72-32M30 5l36 38" opacity=".5" />
        </g>
        <path d="M2 24h7m78 0h7M48 1v5m0 36v5" stroke="currentColor" strokeWidth=".8" />
        <circle cx="74" cy="13" r="3" className="graphic-mark-accent" fill="currentColor" />
      </>}
      {variant === 'globe' && <>
        <g stroke="currentColor" strokeWidth=".85">
          <circle cx="24" cy="24" r="18" />
          <ellipse cx="24" cy="24" rx="12" ry="18" /><ellipse cx="24" cy="24" rx="5" ry="18" />
          <ellipse cx="24" cy="24" rx="18" ry="7" /><path d="M8 15h32M8 33h32M6 24h36" />
          <path d="M1 24h3m40 0h3M24 1v3m0 40v3" opacity=".5" />
        </g>
        <path d="M24 6a18 18 0 0 1 18 18" className="graphic-mark-accent" stroke="currentColor" strokeWidth="1.8" />
      </>}
      {variant === 'chevrons' && <>
        <path d="M5 24 22 7h12L17 24l17 17H22Z" fill="currentColor" />
        <path d="M29 24 46 7h12L41 24l17 17H46Z" stroke="currentColor" strokeWidth="1" />
        <path d="M53 24 70 7h12L65 24l17 17H70Z" stroke="currentColor" strokeWidth="1" />
        <path d="M88 7v34M86 14h5m-5 20h5" className="graphic-mark-accent" stroke="currentColor" />
      </>}
      {variant === 'registration' && <>
        <g stroke="currentColor" strokeWidth=".85">
          <path d="M3 14V3h11m20 0h11v11m0 20v11H34m-20 0H3V34" />
          <path d="m24 9 15 15-15 15L9 24Z" /><circle cx="24" cy="24" r="10" />
          <path d="M24 0v17m0 14v17M0 24h17m14 0h17" opacity=".5" />
        </g>
        <path d="m24 19 5 5-5 5-5-5Z" className="graphic-mark-accent" fill="currentColor" />
      </>}
      {variant === 'weave' && <>
        {Array.from({ length: 5 }, (_, column) => Array.from({ length: 3 }, (_, row) => (
          <path key={`${column}-${row}`} d={`m${17 + column * 14} ${5 + row * 14} 7 7-7 7-7-7Z`} fill={(row + column) % 2 === 0 ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth=".7" opacity={column === 4 ? '.35' : '1'} />
        )))}
        <path d="M2 2h8M6 0v5m81 40h8m-4-4v7" className="graphic-mark-accent" stroke="currentColor" />
      </>}
      {variant === 'modules' && <>
        {Array.from({ length: 12 }, (_, index) => <rect
          key={index}
          x={10 + (index % 6) * 13} y={index < 6 ? 12 : 27}
          width="9" height="9" rx=".5"
          stroke="currentColor" strokeWidth="1.1"
          fill={[0, 1, 6, 8].includes(index) ? 'currentColor' : 'none'}
          opacity={index % 6 === 5 ? '.45' : '1'}
        />)}
        <path d="M6 4H2v9m88 22v9h-4" stroke="currentColor" strokeWidth="1" opacity=".55" />
        <path d="M76 4h9" className="graphic-mark-accent" stroke="currentColor" strokeWidth="2" />
      </>}
      {variant === 'connection' && <>
        <path d="M21 29h11l10-12m12 0 10 12h11" stroke="currentColor" strokeWidth="1.5" />
        <g stroke="currentColor" strokeWidth="1.5">
          <circle cx="16" cy="29" r="5" /><circle cx="48" cy="13" r="6" /><circle cx="80" cy="29" r="5" />
          <path d="M7 42h82M16 39v6m32-6v6m32-6v6" opacity=".45" />
        </g>
        <circle cx="48" cy="13" r="2" className="graphic-mark-accent" fill="currentColor" />
      </>}
      {variant === 'signal' && <>
        <g stroke="currentColor" strokeWidth=".7" opacity=".65"><path d="M2 6h92M2 42h92M7 3v6m82-6v6M7 39v6m82-6v6" /></g>
        {[4, 10, 14, 23, 28, 32, 43, 49, 54, 62, 67, 76, 80, 87, 92].map((x, i) => <path key={x} d={`M${x} 13v22`} stroke="currentColor" strokeWidth={i % 4 === 0 ? '3' : '1'} />)}
        <path d="m41 4 6-3 6 3-6 3Z" className="graphic-mark-accent" fill="currentColor" />
      </>}
      {variant === 'contour' && <>
        <g stroke="currentColor" strokeWidth=".85" strokeLinejoin="round">
          <path d="M11 5 29 2l12 10 4 16-12 16-20-2L3 28 5 14Z" />
          <path d="m14 10 14-3 9 8 3 12-10 12-14-2-8-10 2-11Z" />
          <path d="m17 15 10-3 6 6 2 8-7 8-9-2-5-7 1-7Z" />
          <path d="m21 20 5-2 3 6-4 5-5-4Z" />
        </g>
        <path d="M24 0v8m0 31v9M0 24h9m30 0h9" stroke="currentColor" opacity=".5" />
        <circle cx="38" cy="34" r="2.5" className="graphic-mark-accent" fill="currentColor" />
      </>}
    </svg>
  )
}
