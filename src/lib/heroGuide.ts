import { portfolio } from '../data/portfolio'

export const heroGuideKey = 'jac-hero-guide-shown-v1'
let shownInMemory = false

export function hasSeenHeroGuide() {
  try { return shownInMemory || sessionStorage.getItem(heroGuideKey) === '1' } catch { return shownInMemory }
}

export function markHeroGuideSeen() {
  shownInMemory = true
  try { sessionStorage.setItem(heroGuideKey, '1') } catch { /* Keep the session in memory when storage is blocked. */ }
}

export const heroGuideSteps = [
  { target: '#hero-title', question: 'Who am I?', message: `I’m ${portfolio.shortName}, a Computer Science student who enjoys turning ideas into working software.` },
  { target: '[data-guide="contact"]', question: 'Get in Touch', message: 'Have a project or opportunity? This takes you to my contact details.' },
  { target: '[data-guide="resume"]', question: 'View Resume', message: 'My resume will be available here soon, with my skills and experience.' },
  { target: '[data-guide="home"]', question: 'Home', message: 'This is Home. Your starting point for the portfolio.' },
  { target: '[data-guide="lab"]', question: 'The Lab', message: 'The Lab will hold experiments and side projects. Coming soon.' },
  { target: '[data-guide="ai"]', question: 'Ask me anything', message: 'Curious about my work? Ask me anything about my work and projects here.' },
  { target: '[data-guide="numbers"]', question: 'By the Numbers', message: 'By the Numbers shows project stats and my GitHub activity.' },
  { target: '[data-guide="minimal"]', question: 'Minimal view', message: 'Prefer a simpler layout? Open minimal view.' },
  { target: '[data-guide="theme"]', question: 'Make it yours', message: 'Switch between light and dark mode here.' },
  { target: '.portrait-reveal', question: 'Behind the illustration.', message: 'That’s the tour. Hover or click my illustration to reveal the real me.' },
] as const

type GuideRect = { left: number; top: number; right: number; bottom: number }
type GuideAim = { x: number; y: number }
// The shoulder-side spot marked in the reference, relative to the artwork.
export const heroGuidePortraitAim: GuideAim = { x: .79, y: .61 }

// The SVG uses xMidYMid meet. Account for its letterboxing before aiming at
// the artwork rather than the transparent edge of the full button.
export function heroGuidePortraitBounds(container: GuideRect) {
  const scale = Math.min((container.right - container.left) / 941, (container.bottom - container.top) / 1672)
  const width = 941 * scale
  const height = 1672 * scale
  const left = (container.left + container.right - width) / 2
  const top = (container.top + container.bottom - height) / 2
  return { left, top, right: left + width, bottom: top + height }
}

export function heroGuideTargetPoint(target: GuideRect, aim?: GuideAim) {
  if (aim) return {
    x: target.left + (target.right - target.left) * aim.x,
    y: target.top + (target.bottom - target.top) * aim.y,
  }
  return {
    x: target.right - Math.min(10, (target.right - target.left) * .15),
    y: target.bottom - Math.min(8, (target.bottom - target.top) * .15),
  }
}

// Keep the bubble beside its cursor, flipping together at viewport edges.
export function placeHeroGuide(target: GuideRect, panel: { width: number; height: number }, viewport: { width: number; height: number; top: number }, aim?: GuideAim) {
  const margin = 16
  const maxTop = Math.max(viewport.top, viewport.height - panel.height - margin)
  const point = heroGuideTargetPoint(target, aim)
  const pointerX = Math.max(margin, Math.min(point.x, viewport.width - 24))
  const pointerY = Math.max(viewport.top, Math.min(point.y, viewport.height - 28))
  const left = pointerX + 16 + panel.width > viewport.width - margin ? pointerX - panel.width - 12 : pointerX + 16
  const below = pointerY + 28
  const preferredTop = below + panel.height <= viewport.height - margin ? below : pointerY - panel.height - 12
  return {
    left: Math.max(margin, Math.min(left, viewport.width - panel.width - margin)),
    top: Math.max(viewport.top, Math.min(preferredTop, maxTop)),
    pointerX,
    pointerY,
  }
}
