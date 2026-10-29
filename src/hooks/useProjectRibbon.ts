import { useCallback, useEffect, useRef, useState } from 'react'
import type { FocusEvent, KeyboardEvent, PointerEvent, UIEvent } from 'react'
import useProjectDrag from './useProjectDrag'

export const projectRibbonCopies = 5
export const projectRibbonMiddle = Math.floor(projectRibbonCopies / 2)
const modulo = (value: number, length: number) => ((value % length) + length) % length

export default function useProjectRibbon(projectCount: number, initialProject: number) {
  const listRef = useRef<HTMLDivElement>(null)
  const [activeProject, setActiveProject] = useState(initialProject)
  const activeRef = useRef(initialProject)
  const ready = useRef(false)
  const pointerDown = useRef(false)
  const compact = useRef(false)
  const [isCompact, setIsCompact] = useState(() => window.matchMedia('(max-width: 800px)').matches)
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const centerFrame = useRef<number | null>(null)
  const centerTarget = useRef<number | null>(null)
  const afterCenter = useRef<() => void>(() => {})
  const { dragging, stopMomentum, shiftDragOrigin, dragHandlers } = useProjectDrag(listRef)
  const shiftOriginRef = useRef(shiftDragOrigin)

  useEffect(() => { shiftOriginRef.current = shiftDragOrigin }, [shiftDragOrigin])

  const clearIdle = useCallback(() => {
    if (idleTimer.current !== null) clearTimeout(idleTimer.current)
    idleTimer.current = null
  }, [])

  const cancelCentering = useCallback(() => {
    if (centerFrame.current !== null) cancelAnimationFrame(centerFrame.current)
    centerFrame.current = null
    centerTarget.current = null
  }, [])

  const animateTo = useCallback((target: number) => {
    cancelCentering()
    const list = listRef.current
    if (!list || !compact.current) return
    const from = list.scrollLeft
    const distance = target - from
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || Math.abs(distance) < .75) {
      list.scrollTo({ left: target, behavior: 'instant' })
      afterCenter.current()
      return
    }
    const duration = Math.abs(distance) < 8 ? 350 : 720
    let start: number | null = null
    centerTarget.current = target
    const tick = (time: number) => {
      if (start === null) start = time
      const progress = Math.min(1, (time - start) / duration)
      const eased = progress * progress * (3 - 2 * progress)
      list.scrollTo({ left: from + distance * eased, behavior: 'instant' })
      if (progress < 1) centerFrame.current = requestAnimationFrame(tick)
      else {
        centerFrame.current = null
        centerTarget.current = null
        afterCenter.current()
      }
    }
    centerFrame.current = requestAnimationFrame(tick)
  }, [cancelCentering])

  const geometry = useCallback(() => {
    if (!compact.current) return null
    const list = listRef.current
    const first = list?.children[0] as HTMLElement | undefined
    const second = list?.children[1] as HTMLElement | undefined
    if (!list || !first || !second) return null
    const step = second.getBoundingClientRect().left - first.getBoundingClientRect().left
    return step > 0 ? { list, step } : null
  }, [])

  const settle = useCallback(() => {
    const layout = geometry()
    if (!layout || !ready.current || pointerDown.current || centerFrame.current !== null || layout.list.classList.contains('project-list--dragging')) return
    const { list, step } = layout
    const nearest = Math.round(list.scrollLeft / step)
    const logical = modulo(nearest, projectCount)
    const target = nearest * step
    if (Math.abs(list.scrollLeft - target) > .75) {
      animateTo(target)
      return
    }
    // Identical copies keep the picture unchanged when returning to the middle set.
    const canonical = (projectRibbonMiddle * projectCount + logical) * step
    if (Math.abs(list.scrollLeft - canonical) > .75) list.scrollTo({ left: canonical, behavior: 'instant' })
  }, [animateTo, geometry, projectCount])

  useEffect(() => { afterCenter.current = settle }, [settle])

  const scheduleSettle = useCallback(() => {
    clearIdle()
    idleTimer.current = setTimeout(settle, 150)
  }, [clearIdle, settle])

  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const media = window.matchMedia('(max-width: 800px)')
    const synchronizeLayout = () => {
      compact.current = media.matches
      setIsCompact(media.matches)
      cancelCentering()
      stopMomentum()
      clearIdle()
      pointerDown.current = false
      if (!media.matches) {
        ready.current = false
        activeRef.current = initialProject
        setActiveProject(initialProject)
        list.scrollTo({ left: 0, behavior: 'instant' })
        list.dataset.ready = 'true'
        return
      }
      const layout = geometry()
      if (!layout) return
      list.scrollTo({ left: (projectRibbonMiddle * projectCount + activeRef.current) * layout.step, behavior: 'instant' })
      ready.current = true
      list.dataset.ready = 'true'
    }
    const observer = new ResizeObserver(synchronizeLayout)
    observer.observe(list)
    media.addEventListener('change', synchronizeLayout)
    list.addEventListener('scrollend', settle)
    const releaseOutside = () => {
      if (!pointerDown.current) return
      pointerDown.current = false
      scheduleSettle()
    }
    window.addEventListener('pointerup', releaseOutside)
    window.addEventListener('pointercancel', releaseOutside)
    return () => {
      observer.disconnect()
      media.removeEventListener('change', synchronizeLayout)
      list.removeEventListener('scrollend', settle)
      window.removeEventListener('pointerup', releaseOutside)
      window.removeEventListener('pointercancel', releaseOutside)
      clearIdle()
      cancelCentering()
    }
  }, [cancelCentering, clearIdle, geometry, initialProject, projectCount, scheduleSettle, settle, stopMomentum])

  const onScroll = (event: UIEvent<HTMLDivElement>) => {
    if (!ready.current || !compact.current) return
    const layout = geometry()
    if (!layout) return
    const list = event.currentTarget
    const period = projectCount * layout.step
    let left = list.scrollLeft
    // Keep generous buffers on either side, even through a long held drag.
    if (left < period || left > period * (projectRibbonCopies - 1)) {
      const rebased = projectRibbonMiddle * period + modulo(left, period)
      shiftOriginRef.current(rebased - left)
      list.scrollTo({ left: rebased, behavior: 'instant' })
      left = rebased
    }
    const logical = modulo(Math.round(left / layout.step), projectCount)
    activeRef.current = logical
    setActiveProject(logical)
    if (centerFrame.current === null) scheduleSettle()
  }

  const moveTo = (physicalIndex: number) => {
    const layout = geometry()
    if (!layout) return
    clearIdle()
    stopMomentum()
    animateTo(physicalIndex * layout.step)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || !compact.current) return
    const layout = geometry()
    if (!layout) return
    const current = Math.round((centerTarget.current ?? layout.list.scrollLeft) / layout.step)
    const destinations: Record<string, number> = {
      ArrowLeft: Math.max(projectCount, current - 1),
      ArrowRight: Math.min((projectRibbonCopies - 1) * projectCount, current + 1),
      Home: projectRibbonMiddle * projectCount,
      End: (projectRibbonMiddle + 1) * projectCount - 1,
    }
    if (event.key in destinations) {
      event.preventDefault()
      moveTo(destinations[event.key])
    }
  }

  const onFocusCapture = (event: FocusEvent<HTMLDivElement>) => {
    if (!compact.current || !(event.target instanceof Element)) return
    const card = event.target.closest<HTMLElement>('[data-ribbon-index]')
    if (card && !card.classList.contains('project-tile--clone')) moveTo(Number(card.dataset.ribbonIndex))
  }

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!compact.current) return
    pointerDown.current = true
    clearIdle()
    cancelCentering()
    event.currentTarget.scrollTo({ left: event.currentTarget.scrollLeft, behavior: 'instant' })
    if (event.pointerType !== 'mouse') stopMomentum()
    dragHandlers.onPointerDown(event)
  }
  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!compact.current) return
    pointerDown.current = false
    dragHandlers.onPointerUp(event)
    scheduleSettle()
  }
  const onPointerCancel = (event: PointerEvent<HTMLDivElement>) => {
    if (!compact.current) return
    pointerDown.current = false
    dragHandlers.onPointerCancel(event)
    scheduleSettle()
  }

  return { listRef, activeProject, dragging, isCompact, handlers: { ...dragHandlers, onPointerDown, onPointerUp, onPointerCancel, onScroll, onKeyDown, onFocusCapture } }
}
