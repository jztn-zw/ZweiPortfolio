import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import { test } from 'node:test'
import ts from 'typescript'

// Exercise the routing/animation handoff without a browser or real animation timers.
const source = readFileSync(new URL('../src/hooks/pageNavigation.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2023 } }).outputText
const routeSource = readFileSync(new URL('../src/lib/routes.ts', import.meta.url), 'utf8')
const routes = {}
vm.runInNewContext(ts.transpileModule(routeSource, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports: routes, URL })

function harness({ reduced = false, supported = true, initial = '/', width = 1280, cores = 8, memory = 8, saveData = false, idle = false, lite = false } = {}) {
  const animations = [], frames = [], listeners = new Map(), nodes = [], scrolls = [], anchors = new Map()
  const idleCallbacks = new Map()
  let createdNodes = 0, idleId = 0, frameTime = 0
  const entries = [{ href: new URL(initial, 'https://portfolio.test').href, state: null }]
  let currentUrl = new URL(entries[0].href), historyIndex = 0
  const motion = { matches: reduced, addEventListener: (_, callback) => listeners.set('motion', callback), removeEventListener: () => listeners.delete('motion') }
  class Element {
    children = []
    style = {}
    dataset = {}
    attributes = {}
    setAttribute(name, value) { this.attributes[name] = value }
    getAttribute(name) { return this.attributes[name] ?? null }
    hasAttribute(name) { return name in this.attributes }
    removeAttribute(name) { delete this.attributes[name] }
    addEventListener() {}
    closest() { return this }
    focus() { document.activeElement = this }
    scrollIntoView(options) { scrolls.push(options) }
    append(...children) { this.children.push(...children) }
    remove() { const index = nodes.indexOf(this); if (index >= 0) nodes.splice(index, 1) }
    animate(keyframes, options) {
      let resolve, reject
      const animation = {
        node: this, keyframes, options,
        finished: new Promise((yes, no) => { resolve = yes; reject = no }),
        finish: () => resolve(),
        cancel: () => reject(new Error('Animation cancelled')),
      }
      // Main-content animations are fire-and-forget in the browser.
      void animation.finished.catch(() => {})
      animations.push(animation)
      return animation
    }
  }
  if (!supported) Element.prototype.animate = undefined
  const main = new Element()
  const createElement = () => { createdNodes++; return new Element() }
  const document = {
    documentElement: { dataset: { effects: lite ? 'lite' : 'full' } }, body: { append: node => nodes.push(node) },
    createElement, createElementNS: createElement, querySelector: () => main,
    getElementById: id => { if (!anchors.has(id)) anchors.set(id, new Element()); return anchors.get(id) },
    addEventListener: (event, callback) => listeners.set(event, callback), removeEventListener: event => listeners.delete(event),
  }
  const window = {
    get location() { return currentUrl },
    history: {
      get state() { return entries[historyIndex].state },
      pushState(state, title, href) {
        currentUrl = new URL(href, currentUrl)
        entries.splice(++historyIndex, Infinity, { href: currentUrl.href, state })
      },
      replaceState(state, title, href = currentUrl.href) {
        currentUrl = new URL(href, currentUrl)
        entries[historyIndex] = { href: currentUrl.href, state }
      },
      go(delta) {
        const index = historyIndex + delta
        if (index < 0 || index >= entries.length) return
        historyIndex = index
        currentUrl = new URL(entries[index].href)
        listeners.get('popstate')({ type: 'popstate', state: this.state })
      },
      back() { this.go(-1) },
      forward() { this.go(1) },
    },
    scrollY: 0, scrollTo: options => scrolls.push(options), innerWidth: width, matchMedia: () => motion,
    navigator: { hardwareConcurrency: cores, deviceMemory: memory, connection: { saveData } },
    ...(idle ? {
      requestIdleCallback: callback => { idleCallbacks.set(++idleId, callback); return idleId },
      cancelIdleCallback: id => idleCallbacks.delete(id),
    } : {}),
    addEventListener: (event, callback) => listeners.set(event, callback), removeEventListener: event => listeners.delete(event),
  }
  const exports = {}
  vm.runInNewContext(compiled, { exports, window, document, Element, URL, performance: { now: () => frameTime }, getComputedStyle: node => ({ transform: node.style.transform || 'translateX(0)' }), requestAnimationFrame: callback => frames.push(callback), require: name => name === 'react-dom' ? { flushSync: callback => callback() } : name === '../lib/routes' ? routes : {} })
  let notifications = 0
  const unsubscribe = exports.subscribeToNavigation(() => notifications++)
  return {
    api: exports, animations, nodes, document, window, motion, unsubscribe, entries, scrolls, anchors, listeners, main, idleCallbacks,
    get createdNodes() { return createdNodes },
    idleStep() { const callbacks = Array.from(idleCallbacks.values()); idleCallbacks.clear(); callbacks.forEach(callback => callback()) },
    idle() { while (idleCallbacks.size) { const callbacks = Array.from(idleCallbacks.values()); idleCallbacks.clear(); callbacks.forEach(callback => callback()) } },
    get notifications() { return notifications },
    navigate(href, options = {}) {
      const link = new Element()
      link.href = new URL(href, currentUrl).href
      link.target = options.target ?? ''
      if (options.download) link.setAttribute('download', '')
      if (options.projectBack) link.setAttribute('data-project-back', '')
      if (options.minimalBack) link.setAttribute('data-minimal-back', '')
      const event = { target: link, button: 0, defaultPrevented: false, preventDefault() { this.defaultPrevented = true }, ...options }
      listeners.get('click')(event)
      return event
    },
    hash(hash) { currentUrl.hash = hash; listeners.get('hashchange')() },
    frame(duration = 16) { frameTime += duration; const callbacks = frames.splice(0); callbacks.forEach(callback => callback(frameTime)) },
    changeMotion() { motion.matches = true; listeners.get('motion')() },
  }
}

async function settle() { for (let index = 0; index < 8; index++) await Promise.resolve() }
async function cover(h) { h.animations.forEach(animation => animation.finish()); await settle() }
async function reveal(h) { h.frame(); h.frame(); await settle(); h.animations.forEach(animation => animation.finish()); await settle() }

test('same-page anchors, reduced motion, and missing animation support update immediately', () => {
  for (const options of [{}, { reduced: true }, { supported: false }]) {
    const h = harness(options)
    const destination = Object.keys(options).length ? '/numbers' : '/#projects'
    h.navigate(destination)
    assert.equal(h.api.getNavigationLocation(), destination)
    assert.equal(h.nodes.length, 0)
    assert.equal(h.notifications, 1)
    h.unsubscribe()
  }
})

test('route changes stay hidden until covered and rapid clicks use the latest destination', async () => {
  const h = harness()
  h.navigate('/numbers')
  assert.equal(h.api.getNavigationLocation(), '/')
  assert.equal(h.animations.length, 9)
  h.navigate('/projects/greenway')
  assert.equal(h.animations.length, 9, 'another click should not restart the cover')
  const title = h.nodes[0].children[3].children[1].children[2]
  assert.equal(title.textContent, 'GREENWAY')
  await cover(h)
  assert.equal(h.api.getNavigationLocation(), '/projects/greenway')
  assert.equal(h.notifications, 1)
  await reveal(h)
  assert.equal(h.nodes.length, 0)
  h.unsubscribe()
})

test('navigation after a commit reuses the curtain, even before the reveal animation starts', async () => {
  for (const revealStarted of [false, true]) {
    const h = harness()
    h.navigate('/numbers')
    await cover(h)
    if (revealStarted) { h.frame(); h.frame(); await settle() }
    const curtain = h.nodes[0]
    h.navigate('/')
    assert.equal(h.nodes.length, 1)
    assert.equal(h.nodes[0], curtain)
    assert.equal(curtain.dataset.direction, 'back')
    await cover(h)
    assert.equal(h.api.getNavigationLocation(), '/')
    await reveal(h)
    assert.equal(h.nodes.length, 0)
    h.unsubscribe()
  }
})

test('small screens and constrained devices retain every illustration and the original cut-in motion', async () => {
  const reference = harness()
  reference.navigate('/numbers'); await cover(reference); await reveal(reference)
  const cutInFrames = h => JSON.stringify(h.animations.filter(animation => /page-character-stage|page-logic-card/.test(animation.node.className ?? '')).map(animation => animation.keyframes))
  const expectedFrames = cutInFrames(reference)
  reference.unsubscribe()
  for (const options of [{ width: 390 }, { cores: 2 }, { memory: 2 }, { saveData: true }]) {
    const h = harness(options)
    h.document.documentElement.dataset.theme = 'light'
    h.navigate('/numbers')
    assert.equal(h.nodes[0].dataset.quality, 'lite')
    assert.equal(h.document.documentElement.dataset.pageTransition, 'active')
    const descendants = node => [node, ...node.children.flatMap(descendants)]
    const classes = new Set(descendants(h.nodes[0]).flatMap(node => String(node.className ?? node.attributes.class ?? '').split(/\s+/)))
    for (const name of ['page-logic-card--cube', 'page-logic-card--puzzle', 'page-logic-card--poker', 'page-logic-detail--jigsaw', 'page-logic-detail--knight', 'character-emblem--logic', 'character-emblem--tiles']) assert.ok(classes.has(name), name)
    await cover(h)
    await reveal(h)
    assert.ok(h.animations.every(animation => animation.node !== h.main), 'do not rasterize the entire incoming page')
    assert.equal(cutInFrames(h), expectedFrames, 'the artwork follows the same arrival and exit poses on every device')
    for (const animation of h.animations) {
      for (const frame of animation.keyframes) {
        assert.ok(Object.keys(frame).every(key => ['transform', 'opacity', 'offset'].includes(key)))
      }
    }
    assert.equal(h.document.documentElement.dataset.pageTransition, undefined)
    h.unsubscribe()
  }
})

test('transition styles never conceal illustrations or strip their styling based on hardware', () => {
  const css = readFileSync(new URL('../src/hooks/pageNavigation.css', import.meta.url), 'utf8')
  assert.doesNotMatch(css, /\[data-quality=["']lite["']\]/, 'device scheduling hints must not change artwork styling')
  assert.doesNotMatch(css, /\.page-logic-(?:details|detail--knight)\s*\{[^}]*display:\s*none/, 'resize the smaller illustrations instead of hiding them')
})

test('subsequent transitions reuse the scene, reset its transforms, and reassess device constraints', async () => {
  const h = harness()
  h.navigate('/numbers')
  const curtain = h.nodes[0]
  assert.equal(curtain.dataset.quality, 'full')
  await cover(h)
  await reveal(h)
  assert.equal(h.document.documentElement.dataset.pageTransition, undefined)
  const count = h.createdNodes
  curtain.children[0].style.transform = 'stale'
  h.window.innerWidth = 390
  h.navigate('/')
  assert.equal(h.nodes[0], curtain)
  assert.equal(h.createdNodes, count, 'repeated navigation should not rebuild the SVG scene')
  assert.equal(curtain.dataset.quality, 'lite')
  assert.notEqual(h.animations.at(-9).keyframes[0].transform, 'stale')
  h.api.cancelPageNavigation()
  await settle()
  assert.equal(h.api.getNavigationLocation(), '/')
  assert.equal(h.document.documentElement.dataset.pageTransition, undefined)
  assert.equal(h.nodes.length, 0)
  h.unsubscribe()
})

test('constrained devices prepare in small idle stages and a click reuses partial work', async () => {
  const baseline = harness()
  baseline.navigate('/skills')
  const completeNodeCount = baseline.createdNodes
  baseline.unsubscribe()
  const h = harness({ cores: 2, idle: true })
  assert.equal(h.createdNodes, 0)
  h.idleStep()
  assert.ok(h.createdNodes > 0 && h.createdNodes < completeNodeCount, 'one idle callback must not build the whole scene')
  assert.equal(h.nodes.length, 0, 'partial preparation stays off-screen')
  h.navigate('/skills')
  assert.equal(h.nodes[0].dataset.quality, 'lite')
  assert.equal(h.createdNodes, completeNodeCount, 'finish the partial builder without duplicating its nodes')
  h.idle()
  assert.equal(h.createdNodes, completeNodeCount, 'a queued idle callback must not build a second active scene')
  await cover(h)
  await reveal(h)
  assert.equal(h.api.getNavigationLocation(), '/skills')
  assert.equal(h.nodes.length, 0)
  h.unsubscribe()
})

test('idle preparation moves scene construction off the click path and cancels on unsubscribe', async () => {
  const h = harness({ idle: true })
  assert.equal(h.createdNodes, 0)
  h.idle()
  assert.ok(h.createdNodes > 0)
  assert.equal(h.nodes.length, 0, 'preparing the scene must not display it')
  const count = h.createdNodes
  h.navigate('/skills')
  assert.equal(h.createdNodes, count)
  await cover(h)
  await reveal(h)
  h.unsubscribe()

  const cancelled = harness({ idle: true })
  cancelled.unsubscribe()
  cancelled.idle()
  assert.equal(cancelled.createdNodes, 0)
  assert.equal(harness({ idle: true, reduced: true }).idleCallbacks.size, 0)
  const partial = harness({ idle: true })
  partial.idleStep()
  const partialCount = partial.createdNodes
  partial.unsubscribe(); partial.idle()
  assert.equal(partial.createdNodes, partialCount, 'unmount cancels partially completed preparation')
})

test('the new portrait and title finish their cut-in before the route swaps', async () => {
  const h = harness()
  h.navigate('/numbers')
  const artwork = h.nodes[0].children.find(node => node.className === 'page-cut-in')
  const characterStage = artwork.children[0]
  const image = characterStage.children.find(node => node.className === 'page-cut-in-portrait')
  assert.equal(image.attributes.src, '/images/jaztin-transition-character-v3.webp')
  assert.equal(image.attributes.alt, '')
  const geometry = characterStage.children.filter(node => node.attributes.viewBox)
  assert.equal(geometry.length, 2)
  for (const layer of geometry) {
    assert.equal(layer.attributes.viewBox, '0 0 1122 1402')
    assert.equal(layer.attributes.preserveAspectRatio, 'xMidYMax meet')
  }
  const nameplate = artwork.children[1].children[1]
  assert.equal(nameplate.children.map(letter => letter.textContent).join(''), 'JAZTIN')
  assert.equal(artwork.children[1].children[2].textContent, 'BY THE\nNUMBERS')
  h.animations.slice(0, 3).forEach(animation => animation.finish())
  await settle()
  assert.equal(h.document.documentElement.dataset.pageTransition, 'covered')
  assert.equal(h.api.getNavigationLocation(), '/', 'closing the panels should not cut off the portrait arrival')
  h.animations.slice(3).forEach(animation => animation.finish())
  await settle()
  assert.equal(h.api.getNavigationLocation(), '/numbers')
  assert.equal(h.document.documentElement.dataset.pageTransition, 'active')
  await reveal(h)
  assert.equal(h.nodes.length, 0)
  h.unsubscribe()
})

test('a stalled route handoff skips the whole-page motion and keeps the illustrated reveal', async () => {
  for (const firstFrameTime of [16, 68]) {
    const h = harness()
    h.navigate('/numbers')
    await cover(h)
    h.frame(firstFrameTime)
    h.frame()
    await settle()
    assert.equal(h.animations.filter(animation => animation.node === h.main).length, firstFrameTime === 16 ? 1 : 0)
    assert.equal(h.animations.filter(animation => animation.node.className === 'page-logic-card page-logic-card--puzzle').length, 2)
    h.animations.forEach(animation => animation.finish())
    await settle()
    assert.equal(h.document.documentElement.dataset.pageTransition, undefined)
    h.unsubscribe()
  }
})

test('theme cancellation and a reduced-motion change commit pending navigation safely', async () => {
  for (const mode of ['theme', 'motion']) {
    const h = harness()
    h.navigate('/skills')
    if (mode === 'theme') h.api.cancelPageNavigation()
    else h.changeMotion()
    await settle()
    assert.equal(h.api.getNavigationLocation(), '/skills')
    assert.equal(h.nodes.length, 0)
    assert.equal(h.notifications, 1)
    h.unsubscribe()
  }
})

test('logic props include a standalone cube and puzzle, with only the poker ace framed as a card', async () => {
  const h = harness()
  h.navigate('/numbers')
  const artwork = h.nodes[0].children.find(node => node.className === 'page-cut-in')
  const cards = artwork.children.filter(node => node.dataset.kind)
  assert.deepEqual(Array.from(cards, card => card.dataset.kind), ['cube', 'puzzle', 'poker'])
  const stickers = cards[0].children[0].children.filter(node => node.attributes['data-face'] !== undefined)
  for (let face = 0; face < 3; face++) assert.equal(stickers.filter(node => node.attributes['data-face'] === String(face)).length, 9)
  const hasCardFrame = card => card.children[0].children.some(node => node.attributes.width === '85' && node.attributes.height === '117')
  assert.equal(hasCardFrame(cards[0]), false)
  assert.equal(hasCardFrame(cards[1]), false)
  assert.equal(hasCardFrame(cards[2]), true)
  const puzzleTiles = cards[1].children[0].children
  assert.equal(puzzleTiles.length, 9)
  assert.equal(puzzleTiles.filter(tile => tile.children.some(node => node.textContent)).length, 8)
  assert.equal(puzzleTiles.at(-1).attributes.class, 'page-puzzle-moving-tile', 'the sliding tile should paint above the empty position')
  await cover(h)
  await reveal(h)
  assert.equal(h.nodes.length, 0)
  h.unsubscribe()
})

test('navigation during a theme reveal bypasses the curtain', () => {
  const h = harness()
  h.document.documentElement.dataset.themeTransition = 'reveal'
  h.navigate('/numbers')
  assert.equal(h.api.getNavigationLocation(), '/numbers')
  assert.equal(h.nodes.length, 0)
  h.unsubscribe()
})

test('clean direct links and old hash bookmarks initialize without another history entry', () => {
  for (const [initial, expected] of [
    ['/numbers', '/numbers'], ['/skills/', '/skills'], ['/ask-ai/', '/ask-ai'],
    ['/minimal/projects/vyora/', '/minimal/projects/vyora'],
    ['/?ref=bookmark#/numbers', '/numbers?ref=bookmark'],
    ['/#/projects/greenway/content', '/projects/greenway#greenway-content'], ['/#/ask-ai/content', '/ask-ai#ai-content'],
  ]) {
    const h = harness({ initial })
    assert.equal(h.api.getNavigationLocation(), expected)
    assert.equal(h.window.location.pathname + h.window.location.search + h.window.location.hash, expected)
    assert.equal(h.entries.length, 1)
    assert.equal(h.nodes.length, 0)
    h.unsubscribe()
  }
})

test('Back and Forward preserve clean URLs and wait for the page transition', async () => {
  const h = harness()
  h.navigate('/numbers')
  await cover(h); await reveal(h)
  h.navigate('/skills')
  await cover(h); await reveal(h)
  h.window.history.back()
  assert.equal(h.window.location.pathname, '/numbers')
  assert.equal(h.api.getNavigationLocation(), '/skills')
  h.listeners.get('hashchange')()
  await cover(h); await reveal(h)
  assert.equal(h.api.getNavigationLocation(), '/numbers')
  h.window.history.forward()
  await cover(h); await reveal(h)
  assert.equal(h.api.getNavigationLocation(), '/skills')
  h.unsubscribe()
  assert.equal(h.listeners.has('click'), false)
  assert.equal(h.listeners.has('popstate'), false)
})

test('section links scroll and focus without a page curtain or duplicate history entries', () => {
  const h = harness()
  const event = h.navigate('/#projects')
  assert.equal(event.defaultPrevented, true)
  assert.equal(h.api.getNavigationLocation(), '/#projects')
  assert.equal(h.document.activeElement, h.anchors.get('projects'))
  assert.equal(h.scrolls.at(-1).behavior, 'smooth')
  assert.equal(h.nodes.length, 0)
  h.navigate('/#projects')
  assert.equal(h.entries.length, 2)
  h.navigate('/')
  assert.equal(h.scrolls.at(-1).top, 0)
  h.unsubscribe()
})

test('modified clicks, external links, downloads, assets, and APIs retain native browser behavior', () => {
  const h = harness()
  for (const [href, options] of [
    ['/numbers', { ctrlKey: true }], ['/skills', { metaKey: true }],
    ['/numbers', { shiftKey: true }], ['/numbers', { altKey: true }],
    ['/numbers', { button: 1 }], ['/numbers', { target: '_blank' }],
    ['/numbers', { download: true }], ['https://example.com/numbers', {}],
    ['/api/visitors', {}], ['/images/jaztin-portrait.webp', {}], ['/numbers-extra', {}],
  ]) assert.equal(h.navigate(href, options).defaultPrevented, false)
  assert.equal(h.entries.length, 1)
  assert.equal(h.api.getNavigationLocation(), '/')
  assert.equal(h.nodes.length, 0)
  h.unsubscribe()
})

test('legacy hash navigation converts to a clean path and still uses the curtain', async () => {
  const h = harness()
  h.hash('#/skills')
  assert.equal(h.window.location.pathname, '/skills')
  assert.equal(h.window.location.hash, '')
  assert.equal(h.api.getNavigationLocation(), '/')
  await cover(h); await reveal(h)
  assert.equal(h.api.getNavigationLocation(), '/skills')
  h.unsubscribe()
})

test('Vercel rewrites cover app pages without capturing assets or API functions', () => {
  const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'))
  for (const path of ['/numbers', '/skills', '/projects', '/projects/web-mobile', '/projects/automation', '/projects/tools', '/projects/greenway', '/ask-ai', '/minimal', '/minimal/skills', '/minimal/projects', '/minimal/projects/web-mobile', '/minimal/projects/automation', '/minimal/projects/tools', '/minimal/projects/greenway']) {
    assert.equal(config.rewrites.find(rule => rule.source === path)?.destination, '/index.html')
  }
  assert.ok(config.rewrites.every(rule => routes.isPagePath(rule.source)))
  assert.equal(config.trailingSlash, false)
})

test('project collections have distinct routes and preserve browser history', async () => {
  const h = harness()
  h.navigate('/projects/automation')
  await cover(h); await reveal(h)
  assert.equal(h.api.getNavigationLocation(), '/projects/automation')
  assert.equal(routes.navigationPage(h.api.getNavigationLocation()), 'automationProjects')
  const animationCount = h.animations.length
  h.navigate('/projects/tools')
  assert.equal(h.api.getNavigationLocation(), '/projects/tools')
  assert.equal(h.animations.length, animationCount)
  h.window.history.back()
  assert.equal(h.api.getNavigationLocation(), '/projects/automation')
  h.window.history.forward()
  assert.equal(h.api.getNavigationLocation(), '/projects/tools')
  h.navigate('/projects')
  assert.equal(h.api.getNavigationLocation(), '/projects')
  h.unsubscribe()
})

test('old collection bookmarks resolve to the new page without losing unrelated URL parameters', () => {
  const h = harness({ initial: '/projects/?category=web-mobile&ref=portfolio#project-filters' })
  assert.equal(h.api.getNavigationLocation(), '/projects/web-mobile?ref=portfolio')
  assert.equal(routes.navigationPage(h.api.getNavigationLocation()), 'webMobileProjects')
  assert.equal(h.entries.length, 1)
  h.unsubscribe()
})

test('GreenWay back links return to the originating collection and restore its scroll position', async () => {
  const collection = '/projects/web-mobile'
  const project = '/projects/greenway'
  const h = harness({ initial: collection })
  h.window.scrollY = 520
  h.navigate(project)
  await cover(h); await reveal(h)
  h.navigate(`${project}#greenway-content`)
  h.navigate('/projects', { projectBack: true })
  await cover(h); await reveal(h)
  assert.equal(h.api.getNavigationLocation(), collection)
  assert.equal(h.api.getRestoredProjectScroll(), 520)
  assert.equal(h.entries.length, 3, 'returning should not add a history entry')
  h.window.history.forward()
  await cover(h); await reveal(h)
  assert.equal(h.api.getNavigationLocation(), project)
  assert.equal(h.api.getRestoredProjectScroll(), undefined)
  h.unsubscribe()
})

test('minimal GreenWay returns to its source while direct project visits use the link fallback', () => {
  const minimal = harness({ initial: '/minimal#min-projects-title' })
  minimal.navigate('/minimal/projects/greenway')
  minimal.navigate('/minimal#min-projects-title', { projectBack: true })
  assert.equal(minimal.api.getNavigationLocation(), '/minimal#min-projects-title')
  assert.equal(minimal.entries.length, 2)
  minimal.unsubscribe()

  const direct = harness({ initial: '/projects/greenway', reduced: true })
  direct.navigate('/projects', { projectBack: true })
  assert.equal(direct.api.getNavigationLocation(), '/projects')
  direct.unsubscribe()
})

test('minimal project gallery returns from GreenWay to its saved position', () => {
  const h = harness({ initial: '/minimal/projects' })
  h.window.scrollY = 440
  h.navigate('/minimal/projects/greenway')
  h.navigate('/minimal#min-projects-title', { projectBack: true })
  assert.equal(h.api.getNavigationLocation(), '/minimal/projects')
  assert.equal(h.api.getRestoredProjectScroll(), 440)
  assert.equal(h.animations.length, 0)
  h.unsubscribe()
})

test('shared Minimal Back returns through the actual page chain and restores scroll positions', () => {
  const h = harness({ initial: '/minimal' })
  h.window.scrollY = 640
  h.navigate('/minimal/projects/tools')
  h.window.scrollY = 230
  h.navigate('/minimal/projects/vyora')
  h.window.scrollY = 980
  h.navigate('/minimal/skills')
  const entryCount = h.entries.length
  for (const [page, scroll] of [['/minimal/projects/vyora', 980], ['/minimal/projects/tools', 230], ['/minimal', 640]]) {
    h.navigate('/minimal', { minimalBack: true })
    assert.equal(h.api.getNavigationLocation(), page)
    assert.equal(h.api.getRestoredProjectScroll(), scroll)
  }
  assert.equal(h.entries.length, entryCount, 'Back must traverse history instead of adding another page')
  assert.equal(h.animations.length, 0)
  h.unsubscribe()
})

test('Minimal Back skips same-page filters and anchors, but honors the page that opened it', () => {
  const h = harness({ initial: '/minimal/projects' })
  h.window.scrollY = 410
  h.navigate('/minimal/projects/greenway')
  h.navigate('/minimal/projects/greenway#minimalGreenway-content')
  h.navigate('/minimal/projects/greenway?ref=details#minimalGreenway-content')
  h.navigate('/minimal', { minimalBack: true })
  assert.equal(h.api.getNavigationLocation(), '/minimal/projects')
  assert.equal(h.api.getRestoredProjectScroll(), 410)
  assert.equal(h.entries.length, 4)
  h.unsubscribe()
})

test('direct Minimal subpage Back has a safe home fallback and keeps native modified clicks', () => {
  for (const initial of ['/minimal/skills', '/minimal/projects', '/minimal/projects/automation', '/minimal/projects/greenway', '/minimal/projects/vyora']) {
    const h = harness({ initial })
    assert.equal(h.navigate('/minimal', { minimalBack: true, ctrlKey: true }).defaultPrevented, false)
    h.navigate('/minimal', { minimalBack: true })
    assert.equal(h.api.getNavigationLocation(), '/minimal')
    assert.equal(h.entries.length, 2)
    assert.equal(h.animations.length, 0)
    h.unsubscribe()
  }
})

test('minimal view enters, exits, and restores browser history without a cinematic curtain', () => {
  const h = harness()
  h.navigate('/minimal')
  assert.equal(h.api.getNavigationLocation(), '/minimal')
  assert.equal(h.nodes.length, 0)
  assert.equal(h.animations.length, 0)
  h.window.history.back()
  assert.equal(h.api.getNavigationLocation(), '/')
  h.window.history.forward()
  assert.equal(h.api.getNavigationLocation(), '/minimal')
  h.navigate('/skills')
  assert.equal(h.api.getNavigationLocation(), '/skills')
  assert.equal(h.animations.length, 0)
  h.unsubscribe()
})

test('direct minimal visits avoid scene preparation and can cancel an unfinished full-page transition', async () => {
  const direct = harness({ initial: '/minimal', idle: true })
  direct.idle()
  assert.equal(direct.createdNodes, 0)
  assert.equal(direct.api.getNavigationLocation(), '/minimal')
  direct.unsubscribe()
  const h = harness()
  h.navigate('/numbers')
  assert.equal(h.nodes.length, 1)
  h.navigate('/minimal')
  await settle()
  assert.equal(h.api.getNavigationLocation(), '/minimal')
  assert.equal(h.nodes.length, 0)
  assert.equal(h.document.documentElement.dataset.pageTransition, undefined)
  h.unsubscribe()
})

test('minimal detail routes support direct visits, trailing slashes and history without cinematic artwork', () => {
  for (const initial of ['/minimal/skills', '/minimal/projects/', '/minimal/projects/web-mobile/', '/minimal/projects/automation/', '/minimal/projects/tools/', '/minimal/projects/greenway/']) {
    const h = harness({ initial, idle: true })
    h.idle()
    assert.equal(h.createdNodes, 0)
    assert.equal(h.api.getNavigationLocation(), initial.replace(/\/$/, ''))
    assert.ok(routes.isMinimalPage(routes.navigationPage(initial)))
    h.navigate('/minimal')
    h.navigate('/minimal/skills')
    h.navigate('/minimal/projects/greenway')
    h.window.history.back()
    assert.equal(h.api.getNavigationLocation(), '/minimal/skills')
    h.window.history.forward()
    assert.equal(h.api.getNavigationLocation(), '/minimal/projects/greenway')
    assert.equal(h.animations.length, 0)
    assert.equal(h.nodes.length, 0)
    h.unsubscribe()
  }
})
