import GreenWayArtwork from './GreenWayArtwork'

type ArtworkProps = { variant?: 'hero' | 'terrain' | 'orbit' | 'structure' | 'greenway' }

// Original vector artwork: projected wireframes, with no external image requests.
function torusPath(fixed: number, longitudinal: boolean) {
  const points = Array.from({ length: 145 }, (_, index) => {
    const angle = (index / 144) * Math.PI * 2
    const u = longitudinal ? angle : fixed
    const v = longitudinal ? fixed : angle
    const radius = 138 + 59 * Math.cos(v)
    const x = radius * Math.cos(u)
    const y = radius * Math.sin(u)
    const z = 59 * Math.sin(v)
    const tiltedY = y * 0.48 - z * 0.88
    const rotatedX = x * 0.82 - tiltedY * 0.57
    const rotatedY = x * 0.57 + tiltedY * 0.82
    return `${index ? 'L' : 'M'}${(250 + rotatedX).toFixed(2)},${(250 + rotatedY).toFixed(2)}`
  })
  return points.join(' ') + ' Z'
}

function terrainPath(row: number, vertical: boolean) {
  return Array.from({ length: 81 }, (_, index) => {
    const a = index / 80
    const x = vertical ? row / 22 : a
    const y = vertical ? a : row / 22
    const wave = Math.sin(x * 7 + y * 3) * Math.cos(y * 5 - x * 3)
    return `${index ? 'L' : 'M'}${(x * 650 - 75 + y * 65).toFixed(2)},${(y * 270 + 130 + wave * 57).toFixed(2)}`
  }).join(' ')
}

export default function Artwork({ variant = 'hero' }: ArtworkProps) {
  if (variant === 'greenway') return <GreenWayArtwork />
  if (variant === 'terrain') {
    return (
      <svg viewBox="0 0 650 470" fill="none" aria-hidden="true" className="artwork-svg terrain-svg">
        <g stroke="currentColor" strokeWidth="0.8">
          {Array.from({ length: 23 }, (_, i) => <path key={`h${i}`} d={terrainPath(i, false)} />)}
          {Array.from({ length: 23 }, (_, i) => <path key={`v${i}`} d={terrainPath(i, true)} />)}
        </g>
        <path d="M305 87h40M325 67v40" stroke="currentColor" opacity=".5" />
      </svg>
    )
  }
  if (variant === 'structure') {
    return (
      <svg viewBox="0 0 500 500" fill="none" aria-hidden="true" className="artwork-svg structure-svg">
        {Array.from({ length: 9 }, (_, i) => (
          <g key={i} transform={`translate(0 ${i * -21})`}>
            <path d="m107 330 166-78 121 55-168 79z" fill="#222" stroke="#aaa9a3" strokeWidth="1" />
            <path d="m107 330 119 56v13l-119-55z" fill="#73736e" stroke="#aaa9a3" strokeWidth=".6" />
            <path d="m226 386 168-79v13l-168 79z" fill="#373733" stroke="#aaa9a3" strokeWidth=".6" />
          </g>
        ))}
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 500 500" fill="none" aria-hidden="true" className={`artwork-svg torus-svg ${variant === 'hero' ? 'hero-torus' : ''}`}>
      <g stroke="currentColor" strokeWidth={variant === 'hero' ? '.65' : '.8'}>
        {Array.from({ length: 36 }, (_, i) => <path key={`u${i}`} d={torusPath(i / 36 * Math.PI * 2, false)} />)}
        {Array.from({ length: 18 }, (_, i) => <path key={`v${i}`} d={torusPath(i / 18 * Math.PI * 2, true)} />)}
      </g>
    </svg>
  )
}
