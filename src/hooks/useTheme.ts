import { useSyncExternalStore } from 'react'
import { flushSync } from 'react-dom'
import { createThemeReveal, themeRevealDuration } from './themeReveal'
import { cancelPageNavigation } from './pageNavigation'

type Theme = 'light' | 'dark'
const storageKey = 'jaztin-portfolio-theme'
const changeEvent = 'portfolio-theme-change'
type ThemeOrigin = { x: number; y: number }
let activeTransition: ViewTransition | undefined
let activeAnimation: Animation | undefined
let pendingTheme: Theme | undefined
let transitionVersion = 0
let fallbackTimer: number | undefined

function getTheme(): Theme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
}

function applyTheme(theme: Theme, persist = true) {
  document.documentElement.dataset.theme = theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#f4f3ef' : '#111111')
  if (persist) {
    try { localStorage.setItem(storageKey, theme) } catch { /* The toggle still works when storage is unavailable. */ }
  }
  window.dispatchEvent(new Event(changeEvent))
}

function cancelTransition() {
  transitionVersion += 1
  activeAnimation?.cancel()
  activeAnimation = undefined
  activeTransition?.skipTransition()
  activeTransition = undefined
  pendingTheme = undefined
  if (fallbackTimer !== undefined) window.clearTimeout(fallbackTimer)
  fallbackTimer = undefined
  delete document.documentElement.dataset.themeTransition
  document.documentElement.style.removeProperty('--theme-reveal-x')
  document.documentElement.style.removeProperty('--theme-reveal-y')
}

function toggleTheme(origin?: ThemeOrigin) {
  cancelPageNavigation()
  const nextTheme = (pendingTheme ?? getTheme()) === 'dark' ? 'light' : 'dark'
  cancelTransition()
  const version = transitionVersion
  const root = document.documentElement

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    applyTheme(nextTheme)
    return
  }

  if (typeof document.startViewTransition !== 'function' || !CSS.supports('mask-composite', 'intersect')) {
    root.dataset.themeTransition = 'fade'
    applyTheme(nextTheme)
    fallbackTimer = window.setTimeout(() => {
      if (version === transitionVersion) delete root.dataset.themeTransition
      fallbackTimer = undefined
    }, 320)
    return
  }

  pendingTheme = nextTheme
  const x = Math.max(0, Math.min(origin?.x ?? window.innerWidth / 2, window.innerWidth))
  const y = Math.max(0, Math.min(origin?.y ?? window.innerHeight / 2, window.innerHeight))
  root.style.setProperty('--theme-reveal-x', `${x}px`)
  root.style.setProperty('--theme-reveal-y', `${y}px`)
  root.dataset.themeTransition = 'reveal'

  try {
    const transition = document.startViewTransition(() => {
      if (version === transitionVersion) flushSync(() => applyTheme(nextTheme))
    })
    activeTransition = transition
    void transition.ready.then(() => {
      if (version !== transitionVersion) return
      activeAnimation = root.animate(createThemeReveal(window.innerWidth, window.innerHeight, { x, y }), {
        duration: themeRevealDuration,
        easing: 'cubic-bezier(.4, 0, .2, 1)',
        fill: 'both',
        pseudoElement: '::view-transition-new(root)',
      })
    }).catch(() => { /* Skipped transitions still apply the selected theme. */ })
    const finish = () => {
      if (version !== transitionVersion) return
      activeTransition = undefined
      activeAnimation?.cancel()
      activeAnimation = undefined
      pendingTheme = undefined
      delete root.dataset.themeTransition
      root.style.removeProperty('--theme-reveal-x')
      root.style.removeProperty('--theme-reveal-y')
    }
    void transition.finished.then(finish, finish)
  } catch {
    cancelTransition()
    applyTheme(nextTheme)
  }
}

function subscribe(onChange: () => void) {
  function onStorage(event: StorageEvent) {
    if (event.key === storageKey || event.key === null) {
      cancelTransition()
      applyTheme(event.newValue === 'light' ? 'light' : 'dark', false)
    }
  }
  window.addEventListener(changeEvent, onChange)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(changeEvent, onChange)
    window.removeEventListener('storage', onStorage)
  }
}

export default function useTheme() {
  const theme = useSyncExternalStore(subscribe, getTheme, () => 'dark' as const)
  return { theme, toggleTheme }
}
