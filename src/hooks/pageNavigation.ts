import { flushSync } from 'react-dom'
import { isPagePath, navigationPage, normalizeRoute } from '../lib/routes'
import './pageNavigation.css'

type NavigationRun = {
  curtain: HTMLElement
  panels: HTMLElement[]
  artwork: HTMLElement
  portrait: HTMLElement
  caption: HTMLElement
  title: HTMLElement
  cards: HTMLElement[]
  animations: Animation[]
  phase: 'cover' | 'reveal'
  commit: (() => void) | undefined
}

function browserRoute() {
  const current = window.location.pathname + window.location.search + window.location.hash
  const normalized = normalizeRoute(current)
  if (normalized !== current) window.history.replaceState(window.history.state, '', normalized)
  return normalized
}

let displayedRoute = browserRoute()
let active: NavigationRun | undefined
let preloadedArtwork: HTMLImageElement | undefined
const artworkUrl = '/images/jaztin-transition-character-v3.webp'

export function getNavigationLocation() { return displayedRoute }

function destinationTitle() {
  const titles = { home: 'BACK\nHOME', numbers: 'BY THE\nNUMBERS', skills: 'STACK &\nSKILLS', greenway: 'GREENWAY' }
  return titles[navigationPage(browserRoute())]
}

type LogicCardKind = 'cube' | 'puzzle' | 'poker'
function graphicNode<K extends keyof SVGElementTagNameMap>(tag: K, attributes: Record<string, string>, text?: string) {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag)
  Object.entries(attributes).forEach(([name, value]) => node.setAttribute(name, value))
  if (text) node.textContent = text
  return node
}

function createCharacterStage() {
  const stage = document.createElement('div')
  stage.className = 'page-character-stage'
  const registeredLayer = (side: 'back' | 'front') => graphicNode('svg', {
    viewBox: '0 0 1122 1402', preserveAspectRatio: 'xMidYMax meet', fill: 'none',
    class: `page-character-geometry page-character-geometry--${side}`, 'aria-hidden': 'true',
  })
  const back = registeredLayer('back')
  // Keep the larger shoulder accent and smaller emblems separated so the
  // silhouette stays readable. Both layers share the PNG's coordinate system.
  const shoulderAccent = graphicNode('g', { class: 'character-shoulder-accent' })
  shoulderAccent.append(
    graphicNode('path', { d: 'M105 387 314 291 281 341 171 384 157 407 94 429 123 394Z', fill: '#111' }),
    graphicNode('path', { d: 'm121 384 179-82-27 33-110 44-12 22-40 15 25-31Z', fill: '#c72f38' }),
    graphicNode('path', { d: 'm121 384 179-82-59 46-78 31Z', fill: '#e04a4d' }),
    graphicNode('path', { d: 'm163 379 110-44-25 24-97 42Z', fill: '#8e202b' }),
    graphicNode('path', { d: 'm112 382 181-83', stroke: '#eeece1', 'stroke-width': '2', opacity: '.75' }),
    graphicNode('path', { d: 'm100 440 145-61-13 17-149 61Z', fill: '#eeece1' }),
    graphicNode('path', { d: 'm126 434 51-21m8-4 16-7', stroke: '#111', 'stroke-width': '2' }),
  )
  const logicEmblem = graphicNode('g', { class: 'character-emblem character-emblem--logic' })
  logicEmblem.append(
    graphicNode('path', { d: 'm161 650 39 39-39 39-39-39Z', fill: '#111', stroke: '#eeece1', 'stroke-width': '2.5' }),
    graphicNode('path', { d: 'm161 662 27 27-27 27-27-27Z', stroke: '#eeece1', 'stroke-width': '1', opacity: '.4' }),
    graphicNode('path', { d: 'm161 674 15 15-15 15-15-15Z', fill: '#c72f38' }),
    graphicNode('path', { d: 'm161 674 15 15h-15l-15 0Z', fill: '#e04a4d' }),
    graphicNode('path', { d: 'M161 641v-9m0 114v-9m48-48h9m-114 0h9', stroke: '#c72f38', 'stroke-width': '2' }),
  )
  const directionEmblem = graphicNode('g', { class: 'character-emblem character-emblem--direction' })
  directionEmblem.append(
    graphicNode('path', { d: 'm944 381 35-20-8 27-35 20 14-20Zm31 25 35-20-8 27-35 20 14-20Z', fill: '#eeece1' }),
    graphicNode('path', { d: 'm944 381 35-20-22 24Zm31 25 35-20-22 24Z', fill: '#a3a095' }),
    graphicNode('path', { d: 'm941 421 18-10m9 22 18-10', stroke: '#c72f38', 'stroke-width': '3' }),
    graphicNode('path', { d: 'm990 353 25-14-5 14', stroke: '#eeece1', 'stroke-width': '1.5', opacity: '.45' }),
  )
  back.append(shoulderAccent, logicEmblem, directionEmblem)

  const image = document.createElement('img')
  image.className = 'page-cut-in-portrait'
  image.setAttribute('src', artworkUrl)
  image.setAttribute('alt', '')
  image.setAttribute('decoding', 'async')
  image.setAttribute('draggable', 'false')

  const front = registeredLayer('front')
  const sleeveMarks = graphicNode('g', { class: 'character-sleeve-marks', 'data-region': 'sleeve' })
  sleeveMarks.append(
    graphicNode('path', { d: 'm850 476 23 9-19 41-23-9Z', fill: '#111', stroke: '#eeece1', 'stroke-width': '1.5', 'stroke-opacity': '.45' }),
    graphicNode('path', { d: 'm853 485 10 4-5 10-10-4Zm-8 17 10 4-5 10-10-4Z', fill: '#c72f38' }),
  )
  const tileEmblem = graphicNode('g', { class: 'character-emblem character-emblem--tiles' })
  tileEmblem.append(
    graphicNode('path', { d: 'm539 1002 15-15 15 15-15 15Zm19 19 15-15 15 15-15 15Zm-38 0 15-15 15 15-15 15Z', fill: '#eeece1' }),
    graphicNode('path', { d: 'm539 1040 15-15 15 15-15 15Z', fill: '#c72f38' }),
    graphicNode('path', { d: 'm539 1040 15-15v15Z', fill: '#e04a4d' }),
    graphicNode('path', { d: 'm515 1041 0 12 12 0m54-52 12 0 0 12', stroke: '#eeece1', 'stroke-width': '1.5', opacity: '.5' }),
  )
  front.append(sleeveMarks, tileEmblem)
  stage.append(back, image, front)
  return stage
}

function createLogicCard(kind: LogicCardKind) {
  const card = document.createElement('div')
  card.className = `page-logic-card page-logic-card--${kind}`
  card.dataset.kind = kind
  const graphic = graphicNode('svg', { viewBox: '0 0 88 120', fill: 'none', class: 'page-logic-graphic', 'aria-hidden': 'true' })
  graphic.append(graphicNode('rect', { x: '1.5', y: '1.5', width: '85', height: '117', rx: '2', fill: kind === 'poker' ? '#eeece1' : '#111', stroke: '#eeece1', 'stroke-width': '3' }))
  graphic.append(graphicNode('path', { d: 'M8 23V8h15m42 0h15v15M8 97v15h15m42 0h15V97', stroke: kind === 'poker' ? '#a32732' : '#69675c', 'stroke-width': '.8' }))
  if (kind === 'cube') {
    const faces = [
      { origin: [44, 18], u: [10, 5], v: [-10, 5], colors: ['#eeece1', '#eeece1', '#c72f38'] },
      { origin: [14, 33], u: [10, 5], v: [0, 12], colors: ['#4a4541', '#eeece1', '#272521'] },
      { origin: [44, 48], u: [10, -5], v: [0, 12], colors: ['#d1363a', '#92232c', '#eeece1'] },
    ]
    faces.forEach(({ origin, u, v, colors }, face) => {
      for (let row = 0; row < 3; row++) for (let column = 0; column < 3; column++) {
        const points = [[.08, .08], [.92, .08], [.92, .92], [.08, .92]].map(([x, y]) => `${origin[0] + u[0] * (column + x) + v[0] * (row + y)},${origin[1] + u[1] * (column + x) + v[1] * (row + y)}`).join(' ')
        graphic.append(graphicNode('polygon', { points, fill: colors[(row + column * 2 + face) % 3], stroke: '#080808', 'stroke-width': '.8', 'data-face': String(face) }))
        const edge = [[.14, .18], [.14, .84], [.84, .84]].map(([x, y]) => `${origin[0] + u[0] * (column + x) + v[0] * (row + y)},${origin[1] + u[1] * (column + x) + v[1] * (row + y)}`).join(' ')
        graphic.append(graphicNode('polyline', { points: edge, stroke: '#eeece1', opacity: face === 1 ? '.18' : '.34', 'stroke-width': '.45' }))
      }
    })
    graphic.append(graphicNode('path', { d: 'm44 18 30 15v36L44 84 14 69V33Zm0 30v36M14 33l30 15 30-15', stroke: '#eeece1', opacity: '.6', 'stroke-width': '.55' }))
    graphic.append(graphicNode('path', { d: 'M12 101h64M14 12h13m34 0h13', stroke: '#d1363a', 'stroke-width': '2' }))
  } else if (kind === 'puzzle') {
    let movingTile: SVGGElement | undefined
    for (let index = 0; index < 9; index++) {
      const x = 14 + index % 3 * 21, y = 26 + Math.floor(index / 3) * 23
      const tile = graphicNode('g', { class: index === 7 ? 'page-puzzle-moving-tile' : 'page-puzzle-tile' })
      tile.append(graphicNode('rect', { x: String(x), y: String(y), width: '18', height: '20', fill: index === 8 ? '#0b0b0b' : index === 4 ? '#d1363a' : '#24231f', stroke: index === 8 ? '#d1363a' : '#79766a', 'stroke-width': '.8' }))
      if (index < 8) {
        tile.append(graphicNode('path', { d: `M${x + 2} ${y + 17}V${y + 2}h14`, stroke: '#eeece1', opacity: '.18', 'stroke-width': '.6' }))
        tile.append(graphicNode('text', { x: String(x + 9), y: String(y + 14), fill: '#eeece1', 'font-size': '12', 'text-anchor': 'middle', 'font-family': 'Consolas,monospace' }, String(index + 1)))
      }
      // Draw the moving tile last so it passes over the empty square cleanly.
      if (index === 7) movingTile = tile
      else graphic.append(tile)
    }
    if (movingTile) graphic.append(movingTile)
    graphic.append(graphicNode('path', { d: 'M15 12h58M15 105h58', stroke: '#d1363a', 'stroke-width': '2' }))
  } else {
    const letter = { fill: '#111', 'font-size': '20', 'font-family': 'Georgia,serif', 'font-weight': '700' }
    graphic.append(graphicNode('text', { ...letter, x: '9', y: '22' }, 'A'), graphicNode('text', { ...letter, x: '9', y: '22', transform: 'rotate(180 44 60)' }, 'A'))
    graphic.append(graphicNode('path', { d: 'M44 32C39 41 25 47 25 59C25 72 39 74 44 64C49 74 63 72 63 59C63 47 49 41 44 32ZM41 63L36 82H52L47 63Z', fill: '#111' }))
    graphic.append(graphicNode('path', { d: 'm44 26 25 34-25 30-25-30Zm0 7 20 27-20 24-20-24Z', stroke: '#a32732', opacity: '.55', 'stroke-width': '.65' }))
    graphic.append(graphicNode('path', { d: 'M8 108h15M65 12h15', stroke: '#d1363a', 'stroke-width': '2.5' }))
  }
  card.append(graphic)
  return card
}

// Original mixed display lettering, like individually collected print cuts.
// Each glyph has its own silhouette instead of repeating one font treatment.
function createNameLetter(character: string) {
  const glyphs: Record<string, string> = {
    J: 'M28 8H77L75 14C65 14 62 18 61 26L53 65C50 83 38 94 23 94C10 94 5 85 8 77C10 70 20 70 23 76C25 82 20 87 16 86C28 94 33 81 36 65L44 26C46 17 44 14 28 14Z',
    A: 'M14 42C14 29 28 22 42 22C60 22 68 30 68 44V74C68 81 70 83 77 81V87C62 94 53 90 51 82C43 91 31 94 20 90C7 85 5 70 13 61C20 53 35 51 50 47V40C50 27 31 25 26 33C35 38 28 50 19 47C16 46 14 44 14 42ZM50 54C32 59 26 62 26 72C26 86 45 85 50 74Z',
    Z: 'M9 12 76 7 73 25 28 75 56 73 68 57 74 58 69 90 3 94 5 76 50 25 24 27 13 42 7 41Z',
    T: 'M4 11C25 16 55 4 77 11L73 34H67L63 22 50 23 47 73C47 81 53 84 63 83L62 90H16L17 84C28 83 31 80 31 73L32 25 18 27 9 40 3 39Z',
    I: 'M22 40 53 32 49 72C48 81 52 84 63 83L62 90H13L14 84C25 84 29 81 30 72L32 47 21 47ZM32 17 46 4 58 17 44 30Z',
    N: 'M3 88 7 81 16 79 19 25 9 19 10 12 31 8 62 67 64 24 54 19 55 12 78 10 77 17 71 22 68 89 57 92 26 33 24 78 36 82 35 89Z',
  }
  const glyph = graphicNode('svg', {
    viewBox: '0 0 80 100', class: 'page-name-glyph', 'aria-hidden': 'true',
  })
  glyph.append(graphicNode('path', { d: glyphs[character], fill: 'currentColor', 'fill-rule': 'evenodd' }))
  return glyph
}

// The URL changes normally. React receives the new route only after the shutter
// covers the outgoing content, so unrelated renders cannot expose it early.
export function cancelPageNavigation() {
  const run = active
  if (!run) return
  active = undefined
  run.animations.forEach(animation => animation.cancel())
  run.curtain.remove()
  run.commit?.()
}

async function animateNavigation(commit: () => void) {
  if (active?.phase === 'cover') {
    // Finish the existing close and show the latest requested destination.
    active.commit = commit
    active.title.textContent = destinationTitle()
    return
  }

  let curtain: HTMLElement
  let panels: HTMLElement[]
  let artwork: HTMLElement
  let portrait: HTMLElement
  let caption: HTMLElement
  let title: HTMLElement
  let cards: HTMLElement[]
  if (active) {
    curtain = active.curtain
    panels = active.panels
    artwork = active.artwork
    portrait = active.portrait
    caption = active.caption
    title = active.title
    cards = active.cards
    // A new request during the reveal closes from the current position.
    const transforms = panels.map(panel => getComputedStyle(panel).transform)
    const layers = [artwork, portrait, caption, ...cards]
    const layerPositions = layers.map(layer => {
      const style = getComputedStyle(layer)
      return { transform: style.transform, opacity: style.opacity, clipPath: style.clipPath }
    })
    active.animations.forEach(animation => animation.cancel())
    panels.forEach((panel, index) => { panel.style.transform = transforms[index] })
    layers.forEach((layer, index) => Object.assign(layer.style, layerPositions[index]))
  } else {
    curtain = document.createElement('div')
    curtain.className = 'page-shutter'
    curtain.setAttribute('aria-hidden', 'true')
    panels = Array.from({ length: 3 }, () => {
      const panel = document.createElement('div')
      panel.className = 'page-shutter-panel'
      curtain.append(panel)
      return panel
    })
    artwork = document.createElement('div')
    artwork.className = 'page-cut-in'
    portrait = createCharacterStage()
    caption = document.createElement('div')
    caption.className = 'page-cut-in-caption'
    const byline = document.createElement('span')
    byline.className = 'page-cut-in-byline'
    byline.textContent = 'FULL-STACK DEVELOPER'
    const nameplate = document.createElement('span')
    nameplate.className = 'page-cut-in-nameplate'
    Array.from('JAZTIN').forEach((character, index) => {
      const letter = document.createElement('span')
      letter.className = 'page-cut-in-letter'
      letter.textContent = character
      letter.append(createNameLetter(character))
      letter.style.animationDelay = `${120 + index * 22}ms`
      nameplate.append(letter)
    })
    title = document.createElement('span')
    title.className = 'page-cut-in-title'
    caption.append(byline, nameplate, title)
    artwork.append(portrait, caption)
    cards = (['cube', 'puzzle', 'poker'] as const).map(createLogicCard)
    artwork.append(...cards)
    curtain.append(artwork)
    document.body.append(curtain)
  }

  title.textContent = destinationTitle()
  const run: NavigationRun = { curtain, panels, artwork, portrait, caption, title, cards, animations: [], phase: 'cover', commit }
  active = run
  const compact = window.innerWidth <= 640
  const coverDuration = compact ? 230 : 290
  const revealDuration = compact ? 380 : 460
  const stagger = compact ? 22 : 30
  const backwards = navigationPage(browserRoute()) === 'home'
  const direction = backwards ? -1 : 1
  curtain.dataset.direction = backwards ? 'back' : 'forward'

  try {
    const cover = panels.map((panel, index) => panel.animate([
      { transform: panel.style.transform || `translateX(${-direction * 102}%)` },
      { transform: 'translateX(0)' },
    ], { duration: coverDuration, delay: index * stagger, easing: 'cubic-bezier(.65,0,.25,1)', fill: 'both' }))
    const boardArrival = artwork.animate([
      { opacity: artwork.style.opacity || 0, transform: artwork.style.transform || `translateX(${-direction * 9}%) scale(1.08)`, clipPath: artwork.style.clipPath || (backwards ? 'polygon(100% 0,100% 0,100% 100%,100% 100%)' : 'polygon(0 0,0 0,0 100%,0 100%)') },
      { opacity: 1, transform: 'translateX(0) scale(1)', clipPath: 'polygon(0 0,100% 0,100% 100%,0 100%)', offset: .78 },
      { opacity: 1, transform: 'translateX(0) scale(1)', clipPath: 'polygon(0 0,100% 0,100% 100%,0 100%)' },
    ], { duration: compact ? 660 : 760, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both' })
    const portraitArrival = portrait.animate([
      { opacity: portrait.style.opacity || 0, transform: portrait.style.transform || `translate(${-direction * 18}%,5%) rotate(-7deg) scale(1.06)` },
      { opacity: 1, transform: 'translate(0,0) rotate(0deg) scale(1)' },
    ], { duration: compact ? 410 : 470, delay: 70, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both' })
    const captionArrival = caption.animate([
      { opacity: caption.style.opacity || 0, transform: caption.style.transform || `translateX(${direction * 35}%) rotate(3deg)` },
      { opacity: 1, transform: 'translateX(0) rotate(-4deg)' },
    ], { duration: compact ? 330 : 390, delay: 150, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both' })
    const cardArrival = cards.map((card, index) => card.animate([
      { opacity: card.style.opacity || 0, transform: card.style.transform || `perspective(700px) translateY(45px) rotate(${[-19, -8, 17][index] + 16}deg) rotateY(-25deg) scale(.7)` },
      { opacity: 1, transform: `perspective(700px) translateY(-6px) rotate(${[-19, -8, 17][index] - 3}deg) rotateY(-4deg) scale(1.02)`, offset: .78 },
      { opacity: 1, transform: `perspective(700px) translateY(0) rotate(${[-19, -8, 17][index]}deg) rotateY(0deg) scale(1)` },
    ], { duration: compact ? 360 : 440, delay: 110 + index * 45, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both' }))
    const arrival = [...cover, boardArrival, portraitArrival, captionArrival, ...cardArrival]
    run.animations.push(...arrival)
    await Promise.all(arrival.map(animation => animation.finished))
    if (active !== run) return
    run.commit?.()
    run.commit = undefined

    // Let the new route mount and complete its normal focus/scroll handling.
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
    if (active !== run) return
    run.phase = 'reveal'
    const content = document.querySelector('main')
    if (content) run.animations.push(content.animate([
      { opacity: .45, transform: 'translateY(18px) scale(.992)', transformOrigin: '50% 0' },
      { opacity: 1, transform: 'translateY(0) scale(1)', transformOrigin: '50% 0' },
    ], { duration: revealDuration + stagger * 2, easing: 'cubic-bezier(.16,1,.3,1)' }))

    const reveal = panels.map((panel, index) => panel.animate([
      { transform: 'translateX(0)' },
      { transform: `translateX(${direction * 102}%)` },
    ], { duration: revealDuration, delay: index * stagger, easing: 'cubic-bezier(.76,0,.24,1)', fill: 'both' }))
    const boardExit = artwork.animate([
      { opacity: 1, transform: 'translateX(0) scale(1)', clipPath: 'polygon(0 0,100% 0,100% 100%,0 100%)' },
      { opacity: 0, transform: `translateX(${direction * 8}%) scale(1.04)`, clipPath: backwards ? 'polygon(0 0,0 0,0 100%,0 100%)' : 'polygon(100% 0,100% 0,100% 100%,100% 100%)' },
    ], { duration: compact ? 330 : 390, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'both' })
    const portraitExit = portrait.animate([
      { opacity: 1, transform: 'translate(0,0) rotate(0deg)' },
      { opacity: 0, transform: `translate(${-direction * 18}%,3%) rotate(-5deg)` },
    ], { duration: compact ? 270 : 330, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'both' })
    const captionExit = caption.animate([
      { opacity: 1, transform: 'translateX(0) rotate(-4deg)' },
      { opacity: 0, transform: `translateX(${direction * 40}%) rotate(-8deg)` },
    ], { duration: compact ? 260 : 320, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'both' })
    const cardExit = cards.map((card, index) => card.animate([
      { opacity: 1, transform: `perspective(700px) translateY(0) rotate(${[-19, -8, 17][index]}deg) rotateY(0deg) scale(1)` },
      { opacity: 0, transform: `perspective(700px) translate(${direction * (25 + index * 12)}px,-35px) rotate(${[-19, -8, 17][index] - 20}deg) rotateY(30deg) scale(.85)` },
    ], { duration: compact ? 220 : 280, delay: index * 25, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'both' }))
    run.animations.push(...reveal, boardExit, portraitExit, captionExit, ...cardExit)
    await Promise.all(reveal.map(animation => animation.finished))
    if (active !== run) return
    active = undefined
    run.curtain.remove()
    run.animations.forEach(animation => animation.cancel())
  } catch {
    // Interrupted animations never prevent the latest URL from rendering.
    if (active === run) cancelPageNavigation()
  }
}

export function subscribeToNavigation(onChange: () => void) {
  if (!preloadedArtwork && typeof window.Image === 'function') {
    preloadedArtwork = new window.Image()
    preloadedArtwork.decoding = 'async'
    preloadedArtwork.src = artworkUrl
    void preloadedArtwork.decode().catch(() => { /* The geometric curtain still works if the artwork cannot load. */ })
  }
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
  let requestedRoute = browserRoute()
  const scrollWithinPage = () => {
    const hash = window.location.hash.slice(1)
    let id = hash
    try { id = decodeURIComponent(hash) } catch { /* Treat malformed fragments literally. */ }
    const target = id ? document.getElementById(id) : document.querySelector<HTMLElement>('main h1')
    const behavior = motion.matches ? 'instant' : 'smooth'
    if (id) target?.scrollIntoView({ behavior, block: 'start' })
    else window.scrollTo({ top: 0, behavior })
    if (!target) return
    if (!target.hasAttribute('tabindex')) {
      target.setAttribute('tabindex', '-1')
      target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true })
    }
    target.focus({ preventScroll: true })
  }
  const commit = () => {
    const next = browserRoute()
    const samePage = navigationPage(displayedRoute) === navigationPage(next)
    displayedRoute = next
    flushSync(onChange)
    if (samePage) scrollWithinPage()
  }
  const onLocationChange = () => {
    const next = browserRoute()
    if (next === requestedRoute) return
    requestedRoute = next
    const changedPage = navigationPage(displayedRoute) !== navigationPage(next)
    if ((!changedPage && !active) || motion.matches || document.documentElement.dataset.themeTransition || typeof Element.prototype.animate !== 'function') {
      cancelPageNavigation()
      commit()
      return
    }
    void animateNavigation(commit)
  }
  const onClick = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !(event.target instanceof Element)) return
    const link = event.target.closest<HTMLAnchorElement>('a[href]')
    if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return
    const url = new URL(link.href, window.location.href)
    if (url.origin !== window.location.origin || !isPagePath(url.pathname)) return
    const next = normalizeRoute(url.pathname + url.search + url.hash)
    event.preventDefault()
    if (next === browserRoute()) { scrollWithinPage(); return }
    window.history.pushState(null, '', next)
    onLocationChange()
  }
  const onMotionChange = () => { if (motion.matches) cancelPageNavigation() }
  document.addEventListener('click', onClick)
  window.addEventListener('popstate', onLocationChange)
  window.addEventListener('hashchange', onLocationChange)
  motion.addEventListener('change', onMotionChange)
  return () => {
    document.removeEventListener('click', onClick)
    window.removeEventListener('popstate', onLocationChange)
    window.removeEventListener('hashchange', onLocationChange)
    motion.removeEventListener('change', onMotionChange)
    cancelPageNavigation()
  }
}
