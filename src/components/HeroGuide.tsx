import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { hasSeenHeroGuide, heroGuidePortraitAim, heroGuidePortraitBounds, heroGuideSteps, heroGuideTargetPoint, markHeroGuideSeen, placeHeroGuide } from '../lib/heroGuide'
import './HeroGuide.css'

type Anchor = { left: number; top: number; width: number; height: number; pointerX: number; pointerY: number; panelLeft: number; panelTop: number; tailX: number }

export default function HeroGuide() {
  const [visible, setVisible] = useState(false)
  const [closing, setClosing] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [characters, setCharacters] = useState(0)
  const [moving, setMoving] = useState(true)
  const [departing, setDeparting] = useState(false)
  const [anchor, setAnchor] = useState<Anchor | null>(null)
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [foreground, setForeground] = useState(() => !document.hidden)
  const panelRef = useRef<HTMLElement>(null)
  const firstPlacement = useRef(true)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const step = heroGuideSteps[stepIndex]
  const fullyTyped = reduced || characters >= step.message.length
  const travelling = moving && !reduced
  const nextIndex = useMemo(() => {
    if (!anchor) return -1
    const headerBottom = document.querySelector('.site-header')?.getBoundingClientRect().bottom ?? 64
    return heroGuideSteps.findIndex((candidate, index) => {
      if (index <= stepIndex) return false
      const target = document.querySelector<HTMLElement>(candidate.target)
      if (!target?.getClientRects().length) return false
      const bounds = target.getBoundingClientRect()
      const rect = candidate.target === '.portrait-reveal' ? heroGuidePortraitBounds(bounds) : bounds
      const { x, y } = heroGuideTargetPoint(rect, candidate.target === '.portrait-reveal' ? heroGuidePortraitAim : undefined)
      return x >= 16 && x <= window.innerWidth - 24 && y >= (target.closest('.site-header') ? 12 : headerBottom + 12) && y <= window.innerHeight - 28
    })
  }, [stepIndex, anchor])

  useEffect(() => {
    const update = () => setForeground(!document.hidden)
    document.addEventListener('visibilitychange', update)
    return () => document.removeEventListener('visibilitychange', update)
  }, [])

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    // Replay locally while reviewing the animation; production stays once per session.
    const replayForPreview = import.meta.env.DEV
    if (!replayForPreview && hasSeenHeroGuide()) return
    let startedThisMount = false
    let timer: ReturnType<typeof setTimeout> | undefined
    const start = () => {
      const hero = document.querySelector<HTMLElement>('.hero')
      if (!hero || startedThisMount || (!replayForPreview && hasSeenHeroGuide()) || document.hidden) return
      const bounds = hero.getBoundingClientRect()
      if (bounds.bottom < 160 || bounds.top > window.innerHeight) return
      startedThisMount = true
      markHeroGuideSeen()
      setVisible(true)
    }
    const schedule = () => { timer = setTimeout(start, 450) }
    const onForeground = () => {
      if (!document.hidden && !document.getElementById('startup-screen')) {
        clearTimeout(timer)
        schedule()
      }
    }
    document.addEventListener('visibilitychange', onForeground)
    const startup = document.getElementById('startup-screen')
    let observer: MutationObserver | undefined
    if (startup) {
      observer = new MutationObserver(() => {
        if (!startup.isConnected) { observer?.disconnect(); schedule() }
      })
      observer.observe(document.body, { childList: true })
    } else schedule()
    return () => { observer?.disconnect(); clearTimeout(timer); document.removeEventListener('visibilitychange', onForeground) }
  }, [])

  useEffect(() => () => clearTimeout(closeTimer.current), [])

  useEffect(() => {
    if (!visible || closing || reduced || !foreground) return
    // Normally transitionend releases the message at the actual arrival.
    // Cover unchanged coordinates and browsers that omit that event.
    const fallback = setTimeout(() => setMoving(false), 1800)
    return () => clearTimeout(fallback)
  }, [visible, closing, stepIndex, reduced, foreground])

  const dismiss = () => {
    if (closing) return
    setClosing(true)
    // Restore focus only when the visitor was using controls inside the guide.
    if (panelRef.current?.contains(document.activeElement)) document.getElementById('hero-title')?.focus({ preventScroll: true })
    closeTimer.current = setTimeout(() => setVisible(false), reduced ? 0 : 520)
  }

  useEffect(() => {
    if (!visible || closing) return
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setClosing(true)
        if (panelRef.current?.contains(document.activeElement)) document.getElementById('hero-title')?.focus({ preventScroll: true })
        closeTimer.current = setTimeout(() => setVisible(false), reduced ? 0 : 520)
      }
    }
    window.addEventListener('keydown', keydown)
    return () => window.removeEventListener('keydown', keydown)
  }, [visible, closing, reduced])

  useEffect(() => {
    if (!visible || closing || reduced || !foreground || moving) return
    let interval: ReturnType<typeof setInterval> | undefined
    const pause = setTimeout(() => {
      interval = setInterval(() => setCharacters(current => {
        const next = Math.min(step.message.length, current + 2)
        if (next === step.message.length) clearInterval(interval)
        return next
      }), 28)
    }, 120)
    return () => { clearTimeout(pause); clearInterval(interval) }
  }, [visible, closing, reduced, step, foreground, moving])

  useEffect(() => {
    if (!visible || closing) return
    const target = document.querySelector<HTMLElement>(step.target)
    const panel = panelRef.current
    if (!target || !panel) return
    let frame = 0
    let entryFrame = 0
    let entering = false
    const measure = () => {
      frame = 0
      if (entering) return
      const hero = document.querySelector('.hero')?.getBoundingClientRect()
      if (hero && hero.bottom < 130) {
        setClosing(true)
        closeTimer.current = setTimeout(() => setVisible(false), reduced ? 0 : 520)
        return
      }
      const bounds = target.getBoundingClientRect()
      const portrait = step.target === '.portrait-reveal'
      const rect = portrait ? heroGuidePortraitBounds(bounds) : bounds
      const headerBottom = document.querySelector('.site-header')?.getBoundingClientRect().bottom ?? 64
      const top = target.closest('.site-header') ? 12 : Math.max(16, headerBottom + 12)
      const position = placeHeroGuide(rect, { width: panel.offsetWidth, height: panel.offsetHeight }, { width: window.innerWidth, height: window.innerHeight, top }, portrait ? heroGuidePortraitAim : undefined)
      const next = { left: rect.left - 7, top: rect.top - 7, width: rect.right - rect.left + 14, height: rect.bottom - rect.top + 14, pointerX: position.pointerX, pointerY: position.pointerY, panelLeft: position.left, panelTop: position.top, tailX: Math.max(12, Math.min(panel.offsetWidth - 16, position.pointerX - position.left + 7)) }
      if (firstPlacement.current && !reduced) {
        firstPlacement.current = false
        entering = true
        setAnchor({ ...next, pointerX: window.innerWidth + 40, panelLeft: window.innerWidth + 50 })
        // Give the off-screen position a paint before entering from the side.
        entryFrame = requestAnimationFrame(() => { entryFrame = requestAnimationFrame(() => { entering = false; setAnchor(next) }) })
      } else setAnchor(previous => previous && Object.keys(next).every(key => previous[key as keyof Anchor] === next[key as keyof Anchor]) ? previous : next)
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(measure) }
    const observer = new ResizeObserver(schedule)
    observer.observe(panel)
    observer.observe(target)
    schedule()
    window.addEventListener('resize', schedule)
    window.addEventListener('scroll', schedule, { passive: true })
    window.visualViewport?.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(frame)
      cancelAnimationFrame(entryFrame)
      observer.disconnect()
      window.removeEventListener('resize', schedule)
      window.removeEventListener('scroll', schedule)
      window.visualViewport?.removeEventListener('resize', schedule)
    }
  }, [visible, closing, step, reduced])

  useEffect(() => {
    if (!visible || closing || !fullyTyped || !foreground || travelling || departing) return
    // Reading time starts after the final character, with extra time for longer messages.
    const words = step.message.trim().split(/\s+/).length
    const readingTime = Math.min(3800, Math.max(2800, 800 + words * 140))
    const timer = setTimeout(() => setDeparting(true), readingTime + (nextIndex < 0 ? 400 : 0))
    return () => clearTimeout(timer)
  }, [visible, closing, fullyTyped, nextIndex, foreground, travelling, departing, step.message])

  useEffect(() => {
    if (!departing || closing || !foreground) return
    // Fade the completed message in place before moving the name-only cursor.
    const timer = setTimeout(() => {
      if (nextIndex < 0) {
        setClosing(true)
        closeTimer.current = setTimeout(() => setVisible(false), reduced ? 0 : 520)
        return
      }
      setCharacters(0)
      setMoving(true)
      setStepIndex(nextIndex)
      setDeparting(false)
    }, reduced ? 0 : 320)
    return () => clearTimeout(timer)
  }, [departing, closing, foreground, nextIndex, reduced])

  if (!visible) return null
  return createPortal(
    <div className={`hero-guide${closing ? ' is-closing' : ''}${anchor ? ' is-positioned' : ''}${travelling ? ' is-moving' : ''}${departing ? ' is-departing' : ''}`}>
      {anchor && <>
        <div className="hero-guide-highlight" aria-hidden="true" style={{ width: anchor.width, height: anchor.height, transform: `translate3d(${anchor.left}px, ${anchor.top}px, 0)` }}><i /><i /><i /><i /></div>
      </>}
      <div className="hero-guide-cursor" style={{ transform: `translate3d(${anchor?.pointerX ?? window.innerWidth + 40}px, ${anchor?.pointerY ?? 100}px, 0)` }} onTransitionEnd={event => {
        if (event.target === event.currentTarget && event.propertyName === 'transform') setMoving(false)
      }}>
        <div className="hero-guide-pointer" aria-hidden="true"><svg viewBox="0 0 24 28" fill="none"><path d="M1 1 21 16 12 18 8 26Z" fill="currentColor" stroke="var(--guide-bg)" strokeWidth="1.5" strokeLinejoin="round" /></svg></div>
        <span className="hero-guide-travel-label" aria-hidden="true">Jaztin</span>
        <aside ref={panelRef} className="hero-guide-panel" data-side={anchor && anchor.panelTop < anchor.pointerY ? 'above' : 'below'} aria-label="Jaztin’s introduction" style={{ transform: `translate3d(${anchor ? anchor.panelLeft - anchor.pointerX : 16}px, ${anchor ? anchor.panelTop - anchor.pointerY : 28}px, 0)`, '--guide-tail-x': `${anchor?.tailX ?? 12}px` } as CSSProperties}>
          <span className="hero-guide-sender">Jaztin</span>
          <button type="button" className="hero-guide-close" onClick={dismiss} aria-label="Close introduction"><X size={12} /></button>
          <p className={`hero-guide-text${fullyTyped ? '' : ' is-typing'}`} aria-hidden="true">
            <span className="hero-guide-text-size">{step.message}</span>
            <span className="hero-guide-text-live">{reduced ? step.message : step.message.slice(0, characters)}<span className="hero-guide-caret" /></span>
          </p>
          <p className="sr-only" role="status">{step.message}</p>
        </aside>
      </div>
    </div>, document.body,
  )
}
