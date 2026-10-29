import { useEffect, useId, useRef, useState } from 'react'
import { contactContent } from '../data/portfolio'
import './FooterVerse.css'

export default function FooterVerse() {
  const [open, setOpen] = useState(false)
  const verseId = useId()
  const container = useRef<HTMLDivElement>(null)
  const verse = contactContent.footerVerse

  useEffect(() => {
    if (!open) return
    function dismissOutside(event: PointerEvent) {
      if (event.target instanceof Node && !container.current?.contains(event.target)) setOpen(false)
    }
    function dismissOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', dismissOutside)
    document.addEventListener('keydown', dismissOnEscape)
    return () => {
      document.removeEventListener('pointerdown', dismissOutside)
      document.removeEventListener('keydown', dismissOnEscape)
    }
  }, [open])

  return (
    <div className="footer-verse" ref={container} data-open={open}
      onPointerEnter={event => { if (event.pointerType === 'mouse') setOpen(true) }}
      onPointerLeave={event => { if (event.pointerType === 'mouse') setOpen(false) }}
      onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false) }}>
      <button type="button" className="footer-verse-trigger" aria-expanded={open} aria-controls={verseId} aria-describedby={verseId}
        onClick={() => setOpen(value => !value)}
        onFocus={event => { if (event.currentTarget.matches(':focus-visible')) setOpen(true) }}>
        {verse.reference}
      </button>
      <div id={verseId} className="footer-verse-tooltip" role="tooltip">
        <span className="footer-verse-reference">{verse.reference} · {verse.translation}</span>
        <blockquote>“{verse.text}”</blockquote>
      </div>
    </div>
  )
}
