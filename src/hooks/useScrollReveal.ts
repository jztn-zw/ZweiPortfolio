import { useEffect } from 'react'
import { observePageCover } from '../lib/pageVisibility'
import '../components/ScrollReveal.css'

// Animate layout groups rather than individual cards inside the draggable gallery.
// Existing hover transforms and illustration animations keep their own properties.
// Keep the footer visible: the page end may never reach the inset reveal viewport.
const revealGroups = [
  {
    kind: 'heading',
    selector: '.projects-section-top, .capabilities-heading, .journey-heading, .about-me-heading, .contact-finale-heading, .skills-intro > div, .numbers-intro > div:first-child, .greenway-case-hero, .greenway-case-overview > div:first-child, .greenway-case-features > div, .greenway-case-stack > div:first-child',
  },
  {
    kind: 'gallery',
    selector: '.project-list',
  },
  {
    kind: 'panel',
    selector: '.capability-row, .journey-entry, .skill-discipline, .greenway-case-meta, .greenway-stack-board, .numbers-metric',
  },
  {
    kind: 'graphic',
    selector: '.journey-aside, .about-profile-poster, .about-me-mobile-portrait, .skills-overview, .greenway-case-film, .greenway-case-product',
  },
  {
    kind: 'content',
    selector: '.projects-carousel-controls, .capabilities-footer, .journey-footer, .about-me-copy, .about-me-details, .about-me-footer, .contact-finale-copy, .numbers-intro-copy, .greenway-case-prose, .greenway-case-next, .github-calendar',
  },
  {
    kind: 'rule',
    selector: '.projects-toolbar, .projects-caption, .contact-finale-label, .skills-breadcrumb, .skills-section-divider, .greenway-case-breadcrumb',
  },
] as const

export default function useScrollReveal(page: string) {
  useEffect(() => {
    if (page === 'minimal') return
    if (!('IntersectionObserver' in window)) return

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const targets = new Map<HTMLElement, string>()
    let initialized = false
    let observer: IntersectionObserver | undefined
    const finishTimers = new Map<HTMLElement, ReturnType<typeof setTimeout>>()

    function finish(element: HTMLElement) {
      clearTimeout(finishTimers.get(element))
      finishTimers.delete(element)
      element.dataset.scrollState = 'visible'
      element.style.removeProperty('--scroll-delay')
      observer?.unobserve(element)
    }

    function reset() {
      observer?.disconnect()
      finishTimers.forEach(timer => clearTimeout(timer))
      finishTimers.clear()
      targets.forEach((_, element) => {
        delete element.dataset.scrollReveal
        delete element.dataset.scrollState
        element.style.removeProperty('--scroll-delay')
      })
    }

    function start() {
      reset()
      if (!initialized || motion.matches) return

      if (!targets.size) {
        for (const { selector, kind } of revealGroups) {
          document.querySelectorAll<HTMLElement>(selector).forEach(element => targets.set(element, kind))
        }
      }

      observer = new IntersectionObserver(entries => {
        const entering = entries.filter(entry => entry.isIntersecting && (entry.target as HTMLElement).dataset.scrollState === 'pending')
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left)
        entering.forEach((entry, index) => {
          const element = entry.target as HTMLElement
          const delay = Math.min(index * 32, 64)
          element.style.setProperty('--scroll-delay', `${delay}ms`)
          element.dataset.scrollState = 'entering'
          // Keep content and the calendar spider's entrance available even if
          // a component style replaces its scroll animation.
          finishTimers.set(element, setTimeout(() => finish(element), 520 + delay))
          observer?.unobserve(element)
        })
      }, { threshold: 0 })

      const viewportHeight = window.innerHeight
      const measurements: { element: HTMLElement; kind: string; inView: boolean }[] = []
      targets.forEach((kind, element) => {
        if (!element.getClientRects().length) return
        measurements.push({ element, kind, inView: element.getBoundingClientRect().top < viewportHeight })
      })
      // Measure the whole page before changing styles so each section doesn't trigger its own layout.
      measurements.forEach(({ element, kind, inView }) => {
        element.dataset.scrollReveal = kind
        // Direct links, restored scroll positions, and the first screen stay readable immediately.
        if (inView) {
          finish(element)
        } else {
          element.dataset.scrollState = 'pending'
          observer?.observe(element)
        }
      })
    }

    function handleFocus(event: FocusEvent) {
      if (!(event.target instanceof Element)) return
      let element = event.target.closest<HTMLElement>('[data-scroll-reveal]')
      while (element) {
        finish(element)
        element = element.parentElement?.closest<HTMLElement>('[data-scroll-reveal]') ?? null
      }
    }

    function handleAnimationEnd(event: AnimationEvent) {
      if (event.animationName === 'scroll-enter-soft' && event.target instanceof HTMLElement && event.target.dataset.scrollState === 'entering' && targets.has(event.target)) {
        finish(event.target)
      }
    }

    function initialize() {
      initialized = true
      start()
    }

    // Keep the first viewport visible and defer layout reads until the shutter exits.
    const stopWaiting = document.documentElement.dataset.pageTransition
      ? observePageCover(covered => { if (!covered && !initialized) initialize() })
      : undefined
    if (!stopWaiting) initialize()
    motion.addEventListener('change', start)
    document.addEventListener('focusin', handleFocus)
    document.addEventListener('animationend', handleAnimationEnd)
    return () => {
      stopWaiting?.()
      reset()
      motion.removeEventListener('change', start)
      document.removeEventListener('focusin', handleFocus)
      document.removeEventListener('animationend', handleAnimationEnd)
    }
  }, [page])
}
