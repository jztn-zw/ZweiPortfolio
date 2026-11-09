import { useEffect } from 'react'

const entryOnlySurfaces = new Set(['timeline', 'feature', 'arsenal'])

// One delegated controller per page. One frame per pointer update, no idle loop.
export default function useSurfaceHover(page: string) {
  useEffect(() => {
    if (page === 'minimal') return
    const root = document.querySelector('main')
    if (!root) return
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const touched = new Set<HTMLElement>()
    const paintedValues = new Map<string, string>()
    let active: HTMLElement | null = null
    let frame: number | undefined
    let clientX = 0, clientY = 0
    let touchStart: { x: number; y: number } | undefined

    const stop = () => {
      if (frame !== undefined) cancelAnimationFrame(frame)
      frame = undefined
      if (active) {
        delete active.dataset.hoverActive
        for (const name of ['--surface-dx', '--surface-dy', '--surface-rx', '--surface-ry']) active.style.removeProperty(name)
      }
      active = null
      touchStart = undefined
      paintedValues.clear()
    }
    const surface = (target: EventTarget | null) => target instanceof Element ? target.closest<HTMLElement>('[data-hover-surface]') : null
    const paint = () => {
      frame = undefined
      if (!active || motion.matches || document.hidden) return
      if (entryOnlySurfaces.has(active.dataset.hoverSurface ?? '')) {
        active.dataset.hoverActive = 'true'
        return
      }
      const bounds = active.getBoundingClientRect()
      if (!bounds.width || !bounds.height) { stop(); return }
      const x = Math.max(0, Math.min(bounds.width, clientX - bounds.left))
      const y = Math.max(0, Math.min(bounds.height, clientY - bounds.top))
      const nx = x / bounds.width * 2 - 1, ny = y / bounds.height * 2 - 1
      const values = [
        ['--surface-x', `${x.toFixed(1)}px`], ['--surface-y', `${y.toFixed(1)}px`],
        ['--surface-dx', `${(nx * 4).toFixed(2)}px`], ['--surface-dy', `${(ny * 3).toFixed(2)}px`],
        ['--surface-rx', `${(-ny * 2).toFixed(2)}deg`], ['--surface-ry', `${(nx * 2).toFixed(2)}deg`],
      ]
      // Repeated pointer events at the same coordinates need no style writes.
      for (const [name, value] of values) {
        if (paintedValues.get(name) === value) continue
        active.style.setProperty(name, value)
        paintedValues.set(name, value)
      }
      if (active.dataset.hoverActive !== 'true') active.dataset.hoverActive = 'true'
    }
    const track = (event: PointerEvent) => {
      if (motion.matches || document.hidden || event.isPrimary === false) return
      const next = surface(event.target)
      if (!next || !root.contains(next)) { stop(); return }
      // Entry-only motifs do not need pointer coordinates after activation.
      if (next === active && entryOnlySurfaces.has(next.dataset.hoverSurface ?? '')) return
      if (next !== active) { stop(); active = next; touched.add(next) }
      clientX = event.clientX; clientY = event.clientY
      if (frame === undefined) frame = requestAnimationFrame(paint)
    }
    const move = (event: PointerEvent) => {
      if (event.isPrimary === false) return
      if (event.pointerType === 'touch') {
        if (touchStart && Math.hypot(event.clientX - touchStart.x, event.clientY - touchStart.y) > 10) stop()
        return
      }
      track(event)
    }
    const over = (event: PointerEvent) => { if (event.pointerType !== 'touch') track(event) }
    const out = (event: PointerEvent) => { if (event.isPrimary !== false && active && surface(event.relatedTarget) !== active) stop() }
    const press = (event: PointerEvent) => {
      if (event.button !== 0 || event.isPrimary === false) return
      track(event)
      if (event.pointerType === 'touch' && active) touchStart = { x: event.clientX, y: event.clientY }
    }
    const release = (event: PointerEvent) => { if (event.isPrimary !== false && event.pointerType === 'touch') stop() }
    const onPreference = () => { if (motion.matches) stop() }
    const onVisibility = () => { if (document.hidden) stop() }
    root.addEventListener('pointerover', over, { passive: true })
    root.addEventListener('pointermove', move, { passive: true })
    root.addEventListener('pointerout', out, { passive: true })
    root.addEventListener('pointerdown', press, { passive: true })
    root.addEventListener('pointerup', release, { passive: true })
    root.addEventListener('pointercancel', stop, { passive: true })
    window.addEventListener('scroll', stop, { passive: true, capture: true })
    window.addEventListener('resize', stop, { passive: true })
    window.addEventListener('blur', stop)
    document.addEventListener('visibilitychange', onVisibility)
    motion.addEventListener('change', onPreference)
    return () => {
      stop()
      root.removeEventListener('pointerover', over)
      root.removeEventListener('pointermove', move)
      root.removeEventListener('pointerout', out)
      root.removeEventListener('pointerdown', press)
      root.removeEventListener('pointerup', release)
      root.removeEventListener('pointercancel', stop)
      window.removeEventListener('scroll', stop, true)
      window.removeEventListener('resize', stop)
      window.removeEventListener('blur', stop)
      document.removeEventListener('visibilitychange', onVisibility)
      motion.removeEventListener('change', onPreference)
      touched.forEach(target => {
        for (const name of ['--surface-x', '--surface-y', '--surface-dx', '--surface-dy', '--surface-rx', '--surface-ry']) target.style.removeProperty(name)
      })
    }
  }, [page])
}
