import { useEffect } from 'react'
import './animationVisibility.css'

export default function useAnimationVisibility(page: string) {
  useEffect(() => {
    const targets = document.querySelectorAll('.capability-artwork, .stack-illustration, .numbers-metric-art, .discipline-strip-track')
    const syncDocument = () => document.documentElement.toggleAttribute('data-tab-hidden', document.hidden)
    syncDocument()
    document.addEventListener('visibilitychange', syncDocument)
    const observer = typeof IntersectionObserver === 'function' ? new IntersectionObserver(entries => {
      entries.forEach(entry => entry.target.toggleAttribute('data-animation-paused', !entry.isIntersecting))
    }, { rootMargin: '100px' }) : null
    targets.forEach(target => observer?.observe(target))
    return () => {
      observer?.disconnect()
      targets.forEach(target => target.removeAttribute('data-animation-paused'))
      document.removeEventListener('visibilitychange', syncDocument)
      document.documentElement.removeAttribute('data-tab-hidden')
    }
  }, [page])
}
