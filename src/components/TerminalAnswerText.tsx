import { useEffect, useRef, useState } from 'react'

export default function TerminalAnswerText({ text, pending, onProgress }: { text: string; pending: boolean; onProgress: () => void }) {
  const [visible, setVisible] = useState('')
  const shown = useRef(0)
  const lastPaint = useRef(0)
  const previousText = useRef('')

  useEffect(() => {
    const characters = Array.from(text)
    if (!text.startsWith(previousText.current)) shown.current = 0
    previousText.current = text
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    const tick = (now: number) => {
      frame = 0
      if (shown.current >= characters.length) return
      if (now - lastPaint.current >= 24 || motion.matches) {
        // Catch up gently when a response arrives in one large chunk.
        shown.current = motion.matches ? characters.length : Math.min(characters.length, shown.current + Math.max(1, Math.ceil((characters.length - shown.current) / 24)))
        lastPaint.current = now
        setVisible(characters.slice(0, shown.current).join(''))
      }
      if (shown.current < characters.length) frame = requestAnimationFrame(tick)
    }
    const updateMotion = () => {
      if (!frame) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    motion.addEventListener('change', updateMotion)
    return () => {
      cancelAnimationFrame(frame)
      motion.removeEventListener('change', updateMotion)
    }
  }, [text])

  useEffect(() => { onProgress() }, [visible, onProgress])

  if (!text) return null
  return <p className="ask-response-text min-terminal-answer">
    <span aria-hidden="true">{visible}{(pending || visible !== text) && <span className="min-terminal-cursor">▍</span>}</span>
    <span className="sr-only">{text}</span>
  </p>
}
