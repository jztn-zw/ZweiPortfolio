import { useEffect, useRef } from 'react'

// Decoration only: pointer events stay passive, and movement never rerenders React.
export default function useDetailsPointer() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const panel = ref.current
    if (!panel) return
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const pulse = panel.querySelector<HTMLElement>('.about-details-digital-pulse')
    let frame: number | undefined
    let burst: Animation | undefined
    let active = false
    let clientX = 0, clientY = 0, x = 0, y = 0
    let panelWidth = 0, panelHeight = 0
    let touchStart: { x: number; y: number } | undefined
    let previousTime = 0

    const position = () => {
      const bounds = panel.getBoundingClientRect()
      panelWidth = bounds.width; panelHeight = bounds.height
      return {
        x: Math.max(0, Math.min(bounds.width, clientX - bounds.left)),
        y: Math.max(0, Math.min(bounds.height, clientY - bounds.top)),
      }
    }
    const paint = (turn = 0) => {
      panel.style.setProperty('--details-pointer-x', `${x.toFixed(2)}px`)
      panel.style.setProperty('--details-pointer-y', `${y.toFixed(2)}px`)
      panel.style.setProperty('--details-pointer-turn', `${turn.toFixed(2)}deg`)
      panel.style.setProperty('--details-marker-x', `${Math.max(6, Math.min(panelWidth - 56, x + 14)).toFixed(2)}px`)
      panel.style.setProperty('--details-marker-y', `${Math.max(6, Math.min(panelHeight - 56, y + 14)).toFixed(2)}px`)
    }
    const stop = () => {
      active = false
      touchStart = undefined
      previousTime = 0
      delete panel.dataset.pointerActive
      if (frame !== undefined) cancelAnimationFrame(frame)
      frame = undefined
    }
    const update = (time: number) => {
      frame = undefined
      if (!active) return
      const target = position()
      const amount = 1 - Math.exp(-Math.min(previousTime ? time - previousTime : 16, 50) / 32)
      previousTime = time
      x += (target.x - x) * amount
      y += (target.y - y) * amount
      const settled = Math.abs(target.x - x) + Math.abs(target.y - y) < .2
      if (settled) { x = target.x; y = target.y }
      paint(settled ? 0 : Math.max(-18, Math.min(18, (target.x - x) * .35)))
      if (!settled) frame = requestAnimationFrame(update)
    }
    const track = (event: PointerEvent) => {
      if (motion.matches || event.isPrimary === false) return
      clientX = event.clientX
      clientY = event.clientY
      if (!active) {
        active = true
        const target = position()
        x = target.x; y = target.y
        paint()
      }
      panel.dataset.pointerActive = 'true'
      panel.dataset.pointerType = event.pointerType
      if (frame === undefined) frame = requestAnimationFrame(update)
    }
    const enter = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') track(event)
    }
    const move = (event: PointerEvent) => {
      if (event.pointerType === 'touch') {
        // A drag belongs to the page scroller, rather than this decoration.
        if (touchStart && Math.hypot(event.clientX - touchStart.x, event.clientY - touchStart.y) > 10) stop()
        return
      }
      track(event)
    }
    const press = (event: PointerEvent) => {
      if (motion.matches || event.isPrimary === false || event.button !== 0) return
      track(event)
      if (event.pointerType === 'touch') touchStart = { x: event.clientX, y: event.clientY }
      const target = position()
      panel.style.setProperty('--details-press-x', `${target.x}px`)
      panel.style.setProperty('--details-press-y', `${target.y}px`)
      burst?.cancel()
      if (pulse && typeof pulse.animate === 'function') {
        burst = pulse.animate([
          { opacity: .8, transform: 'scale(.6)' },
          { opacity: .45, transform: 'scale(1.15)', offset: .45 },
          { opacity: 0, transform: 'scale(1.7)' },
        ], { duration: 520, easing: 'cubic-bezier(.16,1,.3,1)' })
      }
    }
    const release = (event: PointerEvent) => { if (event.pointerType === 'touch') stop() }
    const reduceMotion = () => { if (motion.matches) { stop(); burst?.cancel() } }
    panel.addEventListener('pointerenter', enter, { passive: true })
    panel.addEventListener('pointermove', move, { passive: true })
    panel.addEventListener('pointerdown', press, { passive: true })
    panel.addEventListener('pointerup', release, { passive: true })
    panel.addEventListener('pointerleave', stop, { passive: true })
    panel.addEventListener('pointercancel', stop, { passive: true })
    window.addEventListener('scroll', stop, { passive: true, capture: true })
    window.addEventListener('resize', stop, { passive: true })
    window.addEventListener('blur', stop)
    motion.addEventListener('change', reduceMotion)
    return () => {
      stop()
      burst?.cancel()
      panel.removeEventListener('pointerenter', enter)
      panel.removeEventListener('pointermove', move)
      panel.removeEventListener('pointerdown', press)
      panel.removeEventListener('pointerup', release)
      panel.removeEventListener('pointerleave', stop)
      panel.removeEventListener('pointercancel', stop)
      window.removeEventListener('scroll', stop, true)
      window.removeEventListener('resize', stop)
      window.removeEventListener('blur', stop)
      motion.removeEventListener('change', reduceMotion)
      delete panel.dataset.pointerType
      for (const property of ['--details-pointer-x', '--details-pointer-y', '--details-pointer-turn', '--details-marker-x', '--details-marker-y', '--details-press-x', '--details-press-y']) panel.style.removeProperty(property)
    }
  }, [])

  return ref
}
