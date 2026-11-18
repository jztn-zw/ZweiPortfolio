import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import { test } from 'node:test'
import ts from 'typescript'

const source = readFileSync(new URL('../src/hooks/useScrollReveal.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2023 },
}).outputText

function harness({ reduced = false, supported = true, width = 1280, covered = false } = {}) {
  class Element {
    constructor(selector, top = 1000, parent = null) {
      this.selector = selector
      this.top = top
      this.parentElement = parent
      this.dataset = {}
      this.properties = new Map()
      this.style = { setProperty: (name, value) => this.properties.set(name, value), removeProperty: name => this.properties.delete(name) }
    }
    getClientRects() { return [{}] }
    getBoundingClientRect() { return { top: this.top, left: 0 } }
    closest() { return this.dataset.scrollReveal ? this : this.parentElement?.closest() ?? null }
  }
  const heading = new Element('.projects-section-top', 100)
  const panel = new Element('.capability-row')
  const graphic = new Element('.journey-aside', 1200)
  const calendar = new Element('.github-calendar', 1400)
  const footerTop = new Element('.site-footer-top', 1800)
  const footerBottom = new Element('.site-footer-bottom', 1900)
  const targets = [heading, panel, graphic, calendar, footerTop, footerBottom]
  const observers = [], listeners = new Map(), timers = new Map()
  let cleanup, onCoverChange, nextTimer = 0, queries = 0
  const motion = { matches: reduced, addEventListener: (_, handler) => listeners.set('motion', handler), removeEventListener: () => listeners.delete('motion') }
  class Observer {
    observed = new Set()
    constructor(callback) { this.callback = callback; observers.push(this) }
    observe(element) { this.observed.add(element) }
    unobserve(element) { this.observed.delete(element) }
    disconnect() { this.observed.clear() }
  }
  const window = { innerWidth: width, innerHeight: 800, matchMedia: () => motion }
  if (supported) window.IntersectionObserver = Observer
  const document = {
    documentElement: { dataset: { pageTransition: covered ? 'active' : undefined } },
    querySelectorAll(selector) { queries++; return targets.filter(element => selector.split(', ').includes(element.selector)) },
    addEventListener: (name, handler) => listeners.set(name, handler),
    removeEventListener: name => listeners.delete(name),
  }
  const exports = {}
  vm.runInNewContext(compiled, {
    exports, window, document, Element, HTMLElement: Element, IntersectionObserver: Observer,
    setTimeout: (handler, delay) => { timers.set(++nextTimer, { handler, delay }); return nextTimer },
    clearTimeout: id => timers.delete(id),
    require: name => {
      if (name === 'react') return { useEffect: effect => { cleanup = effect() } }
      if (name === '../lib/pageVisibility') return { observePageCover(callback) {
        onCoverChange = callback
        callback(covered)
        return () => { onCoverChange = undefined }
      } }
      return {}
    },
  })
  exports.default('home')
  return {
    heading, panel, graphic, calendar, footerTop, footerBottom, targets, listeners, timers, motion,
    get queries() { return queries },
    uncover() { onCoverChange?.(false) },
    cleanup: () => cleanup?.(),
    enter(...elements) { observers.at(-1).callback(elements.map(target => ({ target, isIntersecting: true, boundingClientRect: target.getBoundingClientRect() }))) },
    focus(target) { listeners.get('focusin')({ target }) },
    child(parent) { return new Element('', 0, parent) },
    end(target, animationName = 'scroll-enter-soft') { listeners.get('animationend')({ target, animationName }) },
  }
}

test('scroll reveals wait for the page shutter without hiding the incoming content', () => {
  const h = harness({ covered: true })
  assert.equal(h.queries, 0)
  assert.ok(h.targets.every(element => element.dataset.scrollState === undefined))
  h.uncover()
  assert.equal(h.heading.dataset.scrollState, 'visible')
  assert.equal(h.panel.dataset.scrollState, 'pending')
  h.cleanup()

  const interrupted = harness({ covered: true })
  interrupted.cleanup()
  interrupted.uncover()
  assert.equal(interrupted.queries, 0)
})

test('footer identity and details remain visible without intersection events on desktop and mobile', () => {
  for (const width of [320, 1280]) {
    const h = harness({ width })
    assert.equal(h.calendar.dataset.scrollState, 'pending', 'other content still uses scroll reveals')
    for (const footerRow of [h.footerTop, h.footerBottom]) {
      assert.equal(footerRow.dataset.scrollReveal, undefined)
      assert.equal(footerRow.dataset.scrollState, undefined, 'footer details must never wait for the inset reveal viewport')
    }
    h.cleanup()
  }
})

test('initial content stays visible and calendar entrance completes even without an animationend event', () => {
  const h = harness()
  assert.equal(h.heading.dataset.scrollState, 'visible')
  assert.equal(h.calendar.dataset.scrollState, 'pending')
  h.enter(h.calendar)
  assert.equal(h.calendar.dataset.scrollState, 'entering')
  assert.equal(h.timers.size, 1)
  for (const timer of [...h.timers.values()]) timer.handler()
  assert.equal(h.calendar.dataset.scrollState, 'visible', 'the spider must not wait indefinitely for the section entrance')
  assert.equal(h.timers.size, 0)
  h.cleanup()
})

test('child animations cannot finish a group early, while focus reveals every pending ancestor', () => {
  const h = harness()
  h.enter(h.panel, h.graphic)
  h.end(h.child(h.panel))
  h.end(h.panel, 'unrelated-hover-animation')
  assert.equal(h.panel.dataset.scrollState, 'entering')
  h.end(h.panel)
  assert.equal(h.panel.dataset.scrollState, 'visible')
  h.graphic.parentElement = h.calendar
  h.focus(h.child(h.graphic))
  assert.equal(h.graphic.dataset.scrollState, 'visible')
  assert.equal(h.calendar.dataset.scrollState, 'visible')
  h.enter(h.graphic, h.calendar)
  assert.equal(h.graphic.dataset.scrollState, 'visible', 'a queued observer event must not hide focused content again')
  assert.equal(h.calendar.dataset.scrollState, 'visible')
  assert.equal(h.timers.size, 0)
  h.cleanup()
})

test('reduced motion and missing observers keep content available; cleanup cancels pending timers', () => {
  for (const options of [{ reduced: true }, { supported: false }]) {
    const h = harness(options)
    assert.ok(h.targets.every(element => element.dataset.scrollState === undefined))
    assert.equal(h.timers.size, 0)
    h.cleanup()
  }
  const h = harness()
  h.enter(h.panel)
  h.motion.matches = true
  h.listeners.get('motion')()
  assert.equal(h.timers.size, 0)
  assert.ok(h.targets.every(element => element.dataset.scrollState === undefined))
  h.motion.matches = false
  h.listeners.get('motion')()
  h.enter(h.panel)
  h.cleanup()
  assert.equal(h.timers.size, 0)
  assert.equal(h.listeners.size, 0)
  assert.ok(h.targets.every(element => element.dataset.scrollReveal === undefined))
})
