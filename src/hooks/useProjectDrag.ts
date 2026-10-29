import { useCallback, useEffect, useRef, useState } from 'react'
import type { MouseEvent, PointerEvent, RefObject } from 'react'

// Touch keeps the browser's native momentum; mouse dragging gets a gentle coast.
export default function useProjectDrag(listRef: RefObject<HTMLDivElement | null>) {
  const [dragging, setDragging] = useState(false)
  const momentum = useRef<number | null>(null)
  const gesture = useRef({ pointer: -1, startX: 0, startLeft: 0, lastX: 0, lastTime: 0, velocity: 0, moved: false })
  const suppressClickUntil = useRef(0)

  const stopMomentum = useCallback(() => {
    if (momentum.current !== null) cancelAnimationFrame(momentum.current)
    momentum.current = null
    gesture.current.pointer = -1
    gesture.current.moved = false
    setDragging(false)
  }, [])

  useEffect(() => () => {
    if (momentum.current !== null) cancelAnimationFrame(momentum.current)
  }, [])

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return
    stopMomentum()
    if (event.target instanceof Element && event.target.closest('a, button')) return
    gesture.current = { pointer: event.pointerId, startX: event.clientX, startLeft: event.currentTarget.scrollLeft, lastX: event.clientX, lastTime: performance.now(), velocity: 0, moved: false }
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = gesture.current
    if (drag.pointer !== event.pointerId) return
    if (!drag.moved && Math.abs(event.clientX - drag.startX) < 5) return
    if (!drag.moved) {
      drag.moved = true
      event.currentTarget.setPointerCapture(event.pointerId)
      setDragging(true)
    }
    event.preventDefault()
    const now = performance.now()
    const velocity = (drag.lastX - event.clientX) / Math.max(1, now - drag.lastTime)
    drag.velocity = Math.max(-3, Math.min(3, drag.velocity * .6 + velocity * .4))
    drag.lastX = event.clientX
    drag.lastTime = now
    event.currentTarget.scrollTo({ left: drag.startLeft + drag.startX - event.clientX, behavior: 'instant' })
  }

  const finishDrag = (event: PointerEvent<HTMLDivElement>, cancelled = false) => {
    const drag = gesture.current
    if (drag.pointer !== event.pointerId) return
    drag.pointer = -1
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    if (!drag.moved) return
    suppressClickUntil.current = performance.now() + 180
    const list = listRef.current
    let velocity = performance.now() - drag.lastTime > 90 ? 0 : drag.velocity
    if (!list || cancelled || window.matchMedia('(prefers-reduced-motion: reduce)').matches || Math.abs(velocity) < .03) {
      stopMomentum()
      return
    }
    let previous = performance.now()
    const coast = (time: number) => {
      const elapsed = Math.min(32, time - previous)
      previous = time
      const before = list.scrollLeft
      list.scrollTo({ left: before + velocity * elapsed, behavior: 'instant' })
      velocity *= Math.exp(-elapsed / 160)
      if (Math.abs(velocity) < .025 || (elapsed > 0 && Math.abs(list.scrollLeft - before) < .1)) {
        momentum.current = null
        setDragging(false)
        return
      }
      momentum.current = requestAnimationFrame(coast)
    }
    momentum.current = requestAnimationFrame(coast)
  }

  const onClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (performance.now() < suppressClickUntil.current) {
      event.preventDefault()
      event.stopPropagation()
    }
  }

  return {
    dragging,
    stopMomentum,
    shiftDragOrigin: (amount: number) => { gesture.current.startLeft += amount },
    dragHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: (event: PointerEvent<HTMLDivElement>) => finishDrag(event),
      onPointerCancel: (event: PointerEvent<HTMLDivElement>) => finishDrag(event, true),
      onClickCapture,
      onDragStart: (event: MouseEvent<HTMLDivElement>) => event.preventDefault(),
    },
  }
}
