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

function harness({ reduced = false, supported = true, initial = '/' } = {}) {
  const animations = [], frames = [], listeners = new Map(), nodes = [], scrolls = [], anchors = new Map()
  const entries = [new URL(initial, 'https://portfolio.test').href]
  let currentUrl = new URL(entries[0]), historyIndex = 0
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
    animate() {
      let resolve, reject
      const animation = {
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
  const document = {
    documentElement: { dataset: {} }, body: { append: node => nodes.push(node) },
    createElement: () => new Element(), createElementNS: () => new Element(), querySelector: () => new Element(),
    getElementById: id => { if (!anchors.has(id)) anchors.set(id, new Element()); return anchors.get(id) },
    addEventListener: (event, callback) => listeners.set(event, callback), removeEventListener: event => listeners.delete(event),
  }
  const window = {
    get location() { return currentUrl },
    history: {
      state: null,
      pushState(_, title, href) { currentUrl = new URL(href, currentUrl); entries.splice(++historyIndex); entries.push(currentUrl.href) },
      replaceState(_, title, href) { currentUrl = new URL(href, currentUrl); entries[historyIndex] = currentUrl.href },
      back() { if (historyIndex > 0) { currentUrl = new URL(entries[--historyIndex]); listeners.get('popstate')() } },
      forward() { if (historyIndex < entries.length - 1) { currentUrl = new URL(entries[++historyIndex]); listeners.get('popstate')() } },
    },
    scrollTo: options => scrolls.push(options), innerWidth: 1280, matchMedia: () => motion,
    addEventListener: (event, callback) => listeners.set(event, callback), removeEventListener: event => listeners.delete(event),
  }
  const exports = {}
  vm.runInNewContext(compiled, { exports, window, document, Element, URL, getComputedStyle: node => ({ transform: node.style.transform || 'translateX(0)' }), requestAnimationFrame: callback => frames.push(callback), require: name => name === 'react-dom' ? { flushSync: callback => callback() } : name === '../lib/routes' ? routes : {} })
  let notifications = 0
  const unsubscribe = exports.subscribeToNavigation(() => notifications++)
  return {
    api: exports, animations, nodes, document, window, motion, unsubscribe, entries, scrolls, anchors, listeners,
    get notifications() { return notifications },
    navigate(href, options = {}) {
      const link = new Element()
      link.href = new URL(href, currentUrl).href
      link.target = options.target ?? ''
      if (options.download) link.setAttribute('download', '')
      const event = { target: link, button: 0, defaultPrevented: false, preventDefault() { this.defaultPrevented = true }, ...options }
      listeners.get('click')(event)
      return event
    },
    hash(hash) { currentUrl.hash = hash; listeners.get('hashchange')() },
    frame() { const callbacks = frames.splice(0); callbacks.forEach(callback => callback()) },
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

test('navigation during reveal reuses the curtain and does not apply stale cleanup', async () => {
  const h = harness()
  h.navigate('/numbers')
  await cover(h)
  h.frame(); h.frame(); await settle()
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
  assert.equal(h.api.getNavigationLocation(), '/', 'closing the panels should not cut off the portrait arrival')
  h.animations.slice(3).forEach(animation => animation.finish())
  await settle()
  assert.equal(h.api.getNavigationLocation(), '/numbers')
  await reveal(h)
  assert.equal(h.nodes.length, 0)
  h.unsubscribe()
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
    ['/numbers', '/numbers'], ['/skills/', '/skills'],
    ['/?ref=bookmark#/numbers', '/numbers?ref=bookmark'],
    ['/#/projects/greenway/content', '/projects/greenway#greenway-content'],
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
  for (const path of ['/numbers', '/skills', '/projects/greenway']) {
    assert.equal(config.rewrites.find(rule => rule.source === path)?.destination, '/index.html')
  }
  assert.ok(config.rewrites.every(rule => routes.isPagePath(rule.source)))
  assert.equal(config.trailingSlash, false)
})
