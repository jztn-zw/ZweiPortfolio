import { useEffect, useRef } from 'react'
import NavbarGlyph from './NavbarGlyph'
import './FloatingNavbar.css'

const items = [
  { label: 'The Lab', icon: 'lab' },
] as const

export default function FloatingNavbar({ isHome = true, isNumbers = false, isAI = false }: { isHome?: boolean; isNumbers?: boolean; isAI?: boolean }) {
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const nav = navRef.current
    if (!nav) return
    let hovered: HTMLElement | null = null
    let frame = 0
    const itemFor = (target: EventTarget | null) => target instanceof Element ? target.closest<HTMLElement>('.side-nav-item') : null
    const positionMarker = () => {
      const focused = nav.contains(document.activeElement) ? itemFor(document.activeElement) : null
      // Coming-soon buttons can retain DOM focus after a click. Keep that
      // accessible focus ring, but never treat them as the selected page.
      const availableFocus = focused?.getAttribute('aria-disabled') === 'true' ? null : focused
      const target = hovered ?? availableFocus ?? nav.querySelector<HTMLElement>('.is-active')
      nav.dataset.markerVisible = target ? 'true' : 'false'
      if (!target) return
      nav.style.setProperty('--nav-marker-x', `${target.offsetLeft}px`)
      nav.style.setProperty('--nav-marker-width', `${target.offsetWidth}px`)
      nav.style.setProperty('--nav-marker-height', `${target.offsetHeight}px`)
    }
    const onPointerOver = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      const target = itemFor(event.target)
      if (!target || !nav.contains(target)) return
      hovered = target
      positionMarker()
    }
    const onPointerLeave = () => { hovered = null; positionMarker() }
    const onClick = (event: MouseEvent) => {
      if (itemFor(event.target)?.getAttribute('aria-disabled') !== 'true') return
      hovered = null
      positionMarker()
    }
    const onFocusChange = () => {
      hovered = null
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => { positionMarker(); nav.dataset.markerReady = 'true' })
    }
    positionMarker()
    // Place the initial frame before enabling the glide, avoiding a slide from x=0.
    frame = requestAnimationFrame(() => { nav.dataset.markerReady = 'true' })
    const resize = new ResizeObserver(positionMarker)
    resize.observe(nav)
    nav.addEventListener('pointerover', onPointerOver)
    nav.addEventListener('pointerleave', onPointerLeave)
    nav.addEventListener('pointercancel', onPointerLeave)
    nav.addEventListener('click', onClick)
    nav.addEventListener('focusin', onFocusChange)
    nav.addEventListener('focusout', onFocusChange)
    return () => {
      cancelAnimationFrame(frame)
      resize.disconnect()
      nav.removeEventListener('pointerover', onPointerOver)
      nav.removeEventListener('pointerleave', onPointerLeave)
      nav.removeEventListener('pointercancel', onPointerLeave)
      nav.removeEventListener('click', onClick)
      nav.removeEventListener('focusin', onFocusChange)
      nav.removeEventListener('focusout', onFocusChange)
      delete nav.dataset.markerReady
    }
  }, [isHome, isNumbers, isAI])

  return (
    <nav ref={navRef} className="side-nav" aria-label="Main navigation">
      <span className="side-nav-marker" aria-hidden="true" />
      <a href="/" data-guide="home" aria-label="Home" aria-current={isHome ? 'page' : undefined} className={`side-nav-item${isHome ? ' is-active' : ''}`}><NavbarGlyph name="home" /><span className="side-nav-tooltip">Home</span></a>
      {items.map(({ label, icon }) => (
        <button type="button" key={label} data-guide={icon} className="side-nav-item" aria-label={`${label} — Coming soon`} aria-disabled="true"><NavbarGlyph name={icon} /><span className="side-nav-tooltip">{label}<span>Coming soon</span></span></button>
      ))}
      <a href="/ask-ai" data-guide="ai" aria-label="Ask me anything" aria-current={isAI ? 'page' : undefined} className={`side-nav-item${isAI ? ' is-active' : ''}`}><NavbarGlyph name="ai" /><span className="side-nav-tooltip">Ask me anything</span></a>
      <a href="/numbers" data-guide="numbers" aria-label="By the Numbers" aria-current={isNumbers ? 'page' : undefined} className={`side-nav-item${isNumbers ? ' is-active' : ''}`}><NavbarGlyph name="numbers" /><span className="side-nav-tooltip">By the Numbers</span></a>
      <button type="button" data-guide="minimal" className="side-nav-item view-mode-button" aria-disabled="true" aria-label="Minimal view — coming soon" aria-describedby="minimal-view-tooltip">
        <NavbarGlyph name="minimal" />
        <span className="side-nav-tooltip" id="minimal-view-tooltip" role="tooltip">Minimal view<span>Coming soon</span></span>
      </button>
    </nav>
  )
}
