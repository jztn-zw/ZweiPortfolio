import { useEffect, useId, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { groupMaskTiles } from '../lib/portraitMask'
import { observePageCover } from '../lib/pageVisibility'
import './PortraitReveal.css'

const pixelSize = 56
const transitionDuration = 1400
const sweepDelay = (y: number) => Math.round(Math.max(0, Math.min(1, (y - 220) / 1200)) * 1000)
const pixels = Array.from({ length: 17 * 30 }, (_, index) => {
  const column = index % 17
  const row = Math.floor(index / 17)
  const scatter = ((column * 13 + row * 11) % 7) * 7
  return { x: column * pixelSize, y: row * pixelSize, delay: sweepDelay(row * pixelSize) + scatter }
})
const fragments = Array.from({ length: 84 }, (_, index) => {
  const column = index % 7
  const row = Math.floor(index / 7)
  const y = 270 + row * 96 + (index * 11) % 19
  return { x: 168 + column * 84 + (row * 11 + column * 7) % 17, y, size: 18 + (index % 3) * 12, delay: sweepDelay(y), dx: (column < 3 ? -1 : 1) * (30 + index % 42), dy: -(24 + index % 36) }
})
// Shared, pixel-aligned edges avoid overlapping translucent cells and dark grid seams.
const pixelTiles = groupMaskTiles(pixels, pixelSize).map(group => <path key={group.delay} className="portrait-pixel" d={group.path} style={{ '--pixel-start': group.delay / transitionDuration } as CSSProperties} />)

export default function PortraitReveal() {
  // Only an explicit reduced-motion preference uses a crossfade, never device power.
  const [lightweight] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [pinned, setPinned] = useState(false)
  const [previewing, setPreviewing] = useState(false)
  const [photoReady, setPhotoReady] = useState(false)
  const [photoUnavailable, setPhotoUnavailable] = useState(false)
  const [transitioning, setTransitioning] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const timelineRef = useRef<Animation | null>(null)
  const targetRef = useRef(false)
  const coveredRef = useRef(false)
  const hintId = useId()
  const subjectMaskId = useId()
  const subjectFilterId = useId()
  const backdropFilterId = useId()
  const backdropMaskId = useId()
  const pixelPhotoId = useId()
  const pixelIllustrationId = useId()
  const fragmentOutgoingId = useId()
  const fragmentIncomingId = useId()
  const showingPhoto = photoReady && (pinned || previewing)

  useEffect(() => {
    const button = buttonRef.current
    if (!button) return
    if (lightweight) return
    // Every tile and fragment follows one reversible clock, including interrupted hovers.
    const timeline = button.animate([
      { '--portrait-progress': '0' },
      { '--portrait-progress': '1' },
    ], { duration: transitionDuration, fill: 'both', easing: 'linear' })
    timeline.pause()
    timeline.currentTime = 0
    timeline.onfinish = () => setTransitioning(false)
    timelineRef.current = timeline
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const stopWatchingCover = observePageCover(covered => {
      coveredRef.current = covered
      if (covered) timeline.pause()
      else if (!reducedMotion.matches && Number(timeline.currentTime) !== (targetRef.current ? transitionDuration : 0)) {
        timeline.updatePlaybackRate(targetRef.current ? 1 : -1)
        timeline.play()
      }
    })
    const settle = () => {
      if (!reducedMotion.matches) return
      timeline.pause()
      timeline.currentTime = targetRef.current ? transitionDuration : 0
      setTransitioning(false)
    }
    reducedMotion.addEventListener('change', settle)
    return () => {
      reducedMotion.removeEventListener('change', settle)
      stopWatchingCover()
      timeline.onfinish = null
      timeline.cancel()
      timelineRef.current = null
    }
  }, [lightweight])

  function changePortrait(nextPinned: boolean, nextPreviewing: boolean) {
    if (photoReady && (nextPinned || nextPreviewing) !== showingPhoto) {
      const reveal = nextPinned || nextPreviewing
      targetRef.current = reveal
      const timeline = timelineRef.current
      if (timeline) {
        const atTarget = Number(timeline.currentTime) === (reveal ? transitionDuration : 0)
        if (atTarget || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          timeline.pause()
          timeline.currentTime = reveal ? transitionDuration : 0
          setTransitioning(false)
        } else {
          setTransitioning(true)
          timeline.updatePlaybackRate(reveal ? 1 : -1)
          if (!coveredRef.current) timeline.play()
        }
      }
    }
    setPinned(nextPinned)
    setPreviewing(nextPreviewing)
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      className={`portrait-reveal${lightweight ? ' portrait-reveal--lite' : ''}${showingPhoto ? ' is-revealed' : ''}${transitioning ? ' is-transitioning' : ''}`}
      aria-label="Real portrait of Jaztin Abram Contreras"
      aria-pressed={pinned}
      aria-describedby={hintId}
      disabled={!photoReady || photoUnavailable}
      onPointerEnter={event => {
        if (event.pointerType === 'mouse') changePortrait(pinned, true)
      }}
      onPointerLeave={() => changePortrait(pinned, false)}
      onClick={() => changePortrait(!pinned, false)}
    >
      {!lightweight && <svg className="portrait-reveal-defs" width="0" height="0" aria-hidden="true" focusable="false">
        <defs>
          <mask id={pixelPhotoId} maskUnits="userSpaceOnUse" x="0" y="0" width="941" height="1672" style={{ maskType: 'alpha' }}><g fill="white">{pixelTiles}</g></mask>
          <mask id={pixelIllustrationId} maskUnits="userSpaceOnUse" x="0" y="0" width="941" height="1672" style={{ maskType: 'luminance' }}>
            <rect width="941" height="1672" fill="white" />
            <g fill="black">{pixelTiles}</g>
          </mask>
        </defs>
      </svg>}
      <span className="portrait-reveal-images" aria-hidden="true">
        <svg className="hero-portrait portrait-reveal-backdrop" viewBox="0 0 941 1672" focusable="false">
          <defs>
            {/* Keep only the illustration's crimson artwork in the permanent backdrop. */}
            <filter id={backdropFilterId} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
              <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  12 -12 0 0 0" />
              <feComponentTransfer><feFuncA type="discrete" tableValues="0 0 0 0 0 0 0 0 1 1" /></feComponentTransfer>
            </filter>
            <mask id={backdropMaskId} maskUnits="userSpaceOnUse" x="0" y="0" width="941" height="1672" style={{ maskType: 'alpha' }}>
              <image href="/images/jaztin-portrait.webp" width="941" height="1672" filter={`url(#${backdropFilterId})`} />
            </mask>
          </defs>
          <image href="/images/jaztin-portrait.webp" width="941" height="1672" mask={`url(#${backdropMaskId})`} />
        </svg>
        <svg className="hero-portrait portrait-reveal-illustration" viewBox="0 0 941 1672" focusable="false">
          <image href="/images/jaztin-portrait.webp" width="941" height="1672" mask={lightweight ? undefined : `url(#${pixelIllustrationId})`} />
        </svg>
        <img
          src="/images/jaztin-portrait-real-matched.webp"
          alt=""
          className="portrait-reveal-preload"
          width="941"
          height="1672"
          decoding="async"
          fetchPriority="low"
          onLoad={() => setPhotoReady(true)}
          onError={() => setPhotoUnavailable(true)}
        />
        <svg className="hero-portrait portrait-reveal-photo" viewBox="0 0 941 1672" focusable="false">
          <defs>
            {/* Use the photo's own jaw/collar silhouette, without the illustration underneath. */}
            <filter id={subjectFilterId} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
              <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  -8 8 0 1 .5" />
              <feComponentTransfer><feFuncA type="discrete" tableValues="0 0 0 0 0 0 0 0 1 1" /></feComponentTransfer>
              <feComposite in2="SourceGraphic" operator="in" />
            </filter>
            <mask id={subjectMaskId} maskUnits="userSpaceOnUse" x="0" y="0" width="941" height="1672" style={{ maskType: 'alpha' }}>
              <image href="/images/jaztin-portrait-real-matched.webp" width="941" height="1672" filter={`url(#${subjectFilterId})`} />
            </mask>
          </defs>
          <g mask={lightweight ? undefined : `url(#${pixelPhotoId})`}>
            <image href="/images/jaztin-portrait-real-matched.webp" width="941" height="1672" mask={`url(#${subjectMaskId})`} style={{ filter: 'grayscale(1)' }} />
          </g>
        </svg>
        {!lightweight && <svg className="hero-portrait portrait-glitch" viewBox="0 0 941 1672" focusable="false">
          <defs>
            <pattern id={fragmentOutgoingId} patternUnits="userSpaceOnUse" width="941" height="1672"><image href="/images/jaztin-portrait.webp" width="941" height="1672" /></pattern>
            <pattern id={fragmentIncomingId} patternUnits="userSpaceOnUse" width="941" height="1672"><image href="/images/jaztin-portrait-real-matched.webp" width="941" height="1672" /></pattern>
          </defs>
          <rect className="portrait-glitch-scan" x="150" y="220" width="640" height="2" />
          {fragments.map((fragment, index) => <g key={index} style={{ '--fragment-start': fragment.delay / transitionDuration, '--fragment-x': `${fragment.dx}px`, '--fragment-y': `${fragment.dy}px` } as CSSProperties}>
            <rect className="portrait-body-fragment portrait-body-fragment--out" x={fragment.x} y={fragment.y} width={fragment.size} height={fragment.size} fill={`url(#${fragmentOutgoingId})`} />
            <rect className="portrait-body-fragment portrait-body-fragment--in" x={fragment.x} y={fragment.y} width={fragment.size} height={fragment.size} fill={`url(#${fragmentIncomingId})`} />
            {index % 2 === 0 && <rect className={`portrait-glitch-pixel portrait-glitch-pixel--${index % 3}`} x={fragment.x + fragment.size} y={fragment.y} width={5 + index % 8} height={5 + index % 8} />}
          </g>)}
        </svg>}
      </span>
      <span id={hintId} className="sr-only">
        {photoUnavailable ? 'Portrait unavailable' : pinned ? 'Tap to return to illustration' : 'Hover or tap to reveal'}
      </span>
    </button>
  )
}
