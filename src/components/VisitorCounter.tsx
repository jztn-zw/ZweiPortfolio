import { useEffect, useState } from 'react'
import { getVisitorCount } from '../lib/visitorCount'

const visitorAvatars = [
  { src: '/images/visitor-avatars/character-01.webp', width: 960, height: 1920 },
  { src: '/images/visitor-avatars/character-02.webp', width: 736, height: 736 },
  { src: '/images/visitor-avatars/character-03.webp', width: 736, height: 736 },
]

export default function VisitorCounter() {
  const [count, setCount] = useState<number | null>(null)
  const [unavailable, setUnavailable] = useState(import.meta.env.DEV)
  const visibleAvatars = visitorAvatars.slice(0, count ?? 0)

  useEffect(() => {
    // Vite serves the frontend only. Tracking starts on the production Vercel site.
    if (import.meta.env.DEV) return
    let active = true
    getVisitorCount().then(value => {
      if (active) setCount(value)
    }).catch(() => {
      if (active) setUnavailable(true)
    })
    return () => { active = false }
  }, [])

  const status = unavailable ? 'Visitor count is currently unavailable.'
    : count === null ? 'Loading visitor count…'
      : undefined

  return (
    <div className="footer-visitors">
      {visibleAvatars.length > 0 ? (
        <span className="footer-visitor-avatars" aria-hidden="true">
          {visibleAvatars.map(avatar => (
            <span className="footer-visitor-avatar" key={avatar.src}>
              <img src={avatar.src} width={avatar.width} height={avatar.height} alt="" loading="lazy" decoding="async" />
            </span>
          ))}
        </span>
      ) : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" stroke="currentColor" strokeWidth="1.3" />
        <path d="M2 4h3M19 4h3M2 20h3m14 0h3" stroke="currentColor" strokeWidth="1.3" />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.3" />
        <circle className="footer-visitors-dot" cx="12" cy="12" r="1" fill="currentColor" />
      </svg>}
      <span className="footer-visitors-summary">
        <span className="footer-visitors-label">{count === 1 ? 'Visitor' : 'Visitors'}</span>
        <strong aria-live="polite" aria-atomic="true" aria-label={status}>{count === null ? '—' : count.toLocaleString('en-US')}</strong>
      </span>
    </div>
  )
}
