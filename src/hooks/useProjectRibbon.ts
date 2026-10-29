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
  const cardStep = useRef(0)
  const hasScrollEnd = useRef(false)
  const afterCenter = useRef<() => void>(() => {})
  const { dragging, stopMomentum, isCoasting, dragHandlers } = useProjectDrag(listRef)

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
    clearIdle()
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
    const duration = Math.abs(distance) < 8 ? 280 : 620
    let start: number | null = null
    centerTarget.current = target
    const tick = (time: number) => {
      if (start === null) start = time
      const progress = Math.min(1, (time - start) / duration)
      // Decelerate into the center without a second acceleration.
      const eased = 1 - Math.pow(1 - progress, 3)
      list.scrollTo({ left: from + distance * eased, behavior: 'instant' })
      if (progress < 1) centerFrame.current = requestAnimationFrame(tick)
      else {
        centerFrame.current = null
        centerTarget.current = null
        afterCenter.current()
      }
    }
    centerFrame.current = requestAnimationFrame(tick)
  }, [cancelCentering, clearIdle])

  const geometry = useCallback(() => {
    if (!compact.current) return null
    const list = listRef.current
    const step = cardStep.current
    if (!list) return null
    return step > 0 ? { list, step } : null
  }, [])

  const settle = useCallback(() => {
    const layout = geometry()
    if (!layout || !ready.current || pointerDown.current || isCoasting() || centerFrame.current !== null) return
    const { list, step } = layout
    const nearest = Math.round(list.scrollLeft / step)
    const logical = modulo(nearest, projectCount)
    activeRef.current = logical
    setActiveProject(logical)
    const target = nearest * step
    if (Math.abs(list.scrollLeft - target) > .75) {
      animateTo(target)
      return
    }
    // Identical copies keep the picture unchanged when returning to the middle set.
    const canonical = (projectRibbonMiddle * projectCount + logical) * step
    if (Math.abs(list.scrollLeft - canonical) > .75) list.scrollTo({ left: canonical, behavior: 'instant' })
  }, [animateTo, geometry, isCoasting, projectCount])

  useEffect(() => { afterCenter.current = settle }, [settle])

  const scheduleSettle = useCallback(() => {
    clearIdle()
    idleTimer.current = setTimeout(settle, 240)
  }, [clearIdle, settle])

  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const media = window.matchMedia('(max-width: 800px)')
    hasScrollEnd.current = 'onscrollend' in list
    let previousWidth = -1
    let previousCompact: boolean | undefined
    const synchronizeLayout = () => {
      // Mobile browser chrome changes the rail's height through svh. Only a
      // horizontal layout change should interrupt a gesture or recenter it.
      const width = list.getBoundingClientRect().width
      if (previousCompact === media.matches && Math.abs(width - previousWidth) < .5) return
      previousWidth = width
      previousCompact = media.matches
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
      const first = list.children[0] as HTMLElement | undefined
      const second = list.children[1] as HTMLElement | undefined
      cardStep.current = first && second
        ? second.getBoundingClientRect().left - first.getBoundingClientRect().left
        : 0
      const layout = geometry()
      if (!layout) return
      list.scrollTo({ left: (projectRibbonMiddle * projectCount + activeRef.current) * layout.step, behavior: 'instant' })
      ready.current = true
      list.dataset.ready = 'true'
    }
    synchronizeLayout()
    const observer = new ResizeObserver(synchronizeLayout)
    observer.observe(list)
    media.addEventListener('change', synchronizeLayout)
    const onScrollEnd = () => {
      clearIdle()
      settle()
    }
    list.addEventListener('scrollend', onScrollEnd)
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
      list.removeEventListener('scrollend', onScrollEnd)
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
    // Never rewrite scrollLeft during native inertia. Rebase identical copies
    // only after centering, when there is no motion for the jump to interrupt.
    if (centerFrame.current !== null) return
    const logical = modulo(Math.round(list.scrollLeft / layout.step), projectCount)
    if (logical !== activeRef.current) {
      activeRef.current = logical
      setActiveProject(logical)
    }
    clearIdle()
    if (!hasScrollEnd.current) scheduleSettle()
  }

  const moveTo = (physicalIndex: number) => {
    const layout = geometry()
    if (!layout) return
    clearIdle()
    stopMomentum()
    const logical = modulo(physicalIndex, projectCount)
    activeRef.current = logical
    setActiveProject(logical)
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

  const onWheel = () => {
    if (!compact.current) return
    clearIdle()
    cancelCentering()
    stopMomentum()
    scheduleSettle()
  }

  // The last mouse coast frame can round to the same scroll offset, producing
  // no scrollend event. Still finish centering once that coast has stopped.
  useEffect(() => {
    if (!dragging) scheduleSettle()
  }, [dragging, scheduleSettle])

  return { listRef, activeProject, dragging, isCompact, handlers: { ...dragHandlers, onPointerDown, onPointerUp, onPointerCancel, onScroll, onWheel, onKeyDown, onFocusCapture } }
}
