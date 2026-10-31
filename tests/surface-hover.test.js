import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import { test } from 'node:test'
import ts from 'typescript'

const source = readFileSync(new URL('../src/hooks/useSurfaceHover.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2023 } }).outputText

function harness({ reduced = false, lite = false, page = 'home' } = {}) {
  const events = new Map(), globalEvents = new Map(), documentEvents = new Map(), frames = new Map()
  let cleanup, nextFrame = 0, preferenceChanged, propertyWrites = 0
  const motion = { matches: reduced, addEventListener: (_, callback) => { preferenceChanged = callback }, removeEventListener: () => { preferenceChanged = undefined } }
  class Element {
    constructor(surface = null) { this.surface = surface; this.dataset = {}; this.properties = new Map(); this.style = { setProperty: (name, value) => { propertyWrites++; this.properties.set(name, value) }, removeProperty: name => this.properties.delete(name) }; this.width = 500 }
    closest() { return this.surface }
    getBoundingClientRect() { return { left: 100, top: 200, width: this.width, height: 200 } }
  }
  const first = new Element(), second = new Element()
  first.surface = first; second.surface = second
  const child = new Element(first)
  const root = {
    contains: target => target === first || target === second || target === child,
    addEventListener: (name, callback, options) => { assert.equal(options.passive, true); events.set(name, callback) },
    removeEventListener: name => events.delete(name),
  }
  const document = { documentElement: { dataset: { effects: lite ? 'lite' : 'full' } }, hidden: false, querySelector: () => root, addEventListener: (name, callback) => documentEvents.set(name, callback), removeEventListener: name => documentEvents.delete(name) }
  const exported = {}
  vm.runInNewContext(compiled, {
    exports: exported, Element, document,
    window: { matchMedia: () => motion, addEventListener: (name, callback) => globalEvents.set(name, callback), removeEventListener: name => globalEvents.delete(name) },
    requestAnimationFrame: callback => { frames.set(++nextFrame, callback); return nextFrame }, cancelAnimationFrame: id => frames.delete(id),
    require: () => ({ useEffect: effect => { cleanup = effect() } }),
  })
  exported.default(page)
  return {
    first, second, child, events, globalEvents, documentEvents, frames, document,
    get propertyWrites() { return propertyWrites },
    event(name, overrides = {}) { events.get(name)({ target: first, relatedTarget: null, clientX: 350, clientY: 300, button: 0, pointerType: 'mouse', isPrimary: true, ...overrides }) },
    paint() { const pending = [...frames.values()]; frames.clear(); pending.forEach(callback => callback()) },
    cleanup: () => cleanup?.(),
    reduceMotion() { motion.matches = true; preferenceChanged() },
  }
}

test('only Minimal View skips decorative pointer tracking', () => {
  const h = harness({ page: 'minimal' })
  assert.equal(h.events.size, 0)
  assert.equal(h.globalEvents.size, 0)
  assert.equal(h.documentEvents.size, 0)
  assert.equal(h.frames.size, 0)
  h.cleanup()
})

test('constrained devices keep full hover feedback without rewriting unchanged coordinates', () => {
  const h = harness({ lite: true })
  h.event('pointerover'); h.paint()
  assert.equal(h.first.dataset.hoverActive, 'true')
  assert.equal(h.propertyWrites, 6)
  h.event('pointermove'); h.paint()
  assert.equal(h.propertyWrites, 6, 'unchanged coordinates should not invalidate styles again')
  h.event('pointermove', { clientX: 420 }); h.paint()
  assert.ok(h.propertyWrites > 6)
  assert.equal(h.frames.size, 0)
  h.cleanup()
})

test('delegated hover coalesces updates and schedules no idle frames', () => {
  const h = harness()
  h.event('pointerover')
  for (let index = 0; index < 20; index++) h.event('pointermove', { clientX: 400 })
  assert.equal(h.frames.size, 1)
  h.paint()
  assert.equal(h.first.dataset.hoverActive, 'true')
  assert.equal(h.first.properties.get('--surface-x'), '300.0px')
  assert.ok(Math.abs(parseFloat(h.first.properties.get('--surface-dx'))) <= 4)
  assert.equal(h.frames.size, 0)
  h.event('pointerout', { relatedTarget: h.child })
  assert.equal(h.first.dataset.hoverActive, 'true', 'moving between descendants must not restart the effect')
  h.first.dataset.hoverSurface = 'timeline'
  h.event('pointermove', { clientX: 450 })
  assert.equal(h.frames.size, 0, 'an entry-only motif should not schedule pointer-tracking work')
  h.cleanup()
})

test('switching surfaces clears the previous one, and bounds stay finite', () => {
  const h = harness()
  h.event('pointerover'); h.paint()
  h.event('pointermove', { target: h.second, clientX: 5000, clientY: -100 }); h.paint()
  assert.equal(h.first.dataset.hoverActive, undefined)
  assert.equal(h.first.properties.get('--surface-dx'), undefined)
  assert.equal(h.second.properties.get('--surface-x'), '500.0px')
  assert.equal(h.second.properties.get('--surface-y'), '0.0px')
  h.second.width = 0
  h.event('pointermove', { target: h.second }); h.paint()
  assert.equal(h.second.dataset.hoverActive, undefined)
  h.cleanup()
})

test('touch leaves vertical scrolling native and stops on release or cancellation', () => {
  const h = harness()
  h.event('pointerover', { pointerType: 'touch' })
  assert.equal(h.frames.size, 0)
  h.event('pointerdown', { pointerType: 'touch' }); h.paint()
  assert.equal(h.first.dataset.hoverActive, 'true')
  h.event('pointermove', { pointerType: 'touch', clientY: 325 })
  h.event('pointermove', { pointerType: 'touch', clientY: 340 })
  assert.equal(h.first.dataset.hoverActive, undefined)
  assert.equal(h.frames.size, 0)
  h.event('pointerdown', { pointerType: 'touch' }); h.paint()
  h.event('pointerup', { pointerType: 'touch' })
  assert.equal(h.first.dataset.hoverActive, undefined)
  h.event('pointerover'); h.event('pointercancel')
  assert.equal(h.frames.size, 0)
  h.cleanup()
})

test('reduced motion, hidden tabs, scrolling and unmount stop all work', () => {
  const h = harness()
  h.event('pointerover'); h.paint()
  h.document.hidden = true
  h.documentEvents.get('visibilitychange')()
  assert.equal(h.first.dataset.hoverActive, undefined)
  h.event('pointermove')
  assert.equal(h.frames.size, 0)
  h.document.hidden = false
  h.event('pointermove'); h.paint()
  h.globalEvents.get('scroll')()
  assert.equal(h.first.dataset.hoverActive, undefined)
  h.event('pointermove'); h.paint()
  h.reduceMotion()
  h.event('pointermove')
  assert.equal(h.frames.size, 0)
  assert.equal(h.first.dataset.hoverActive, undefined)
  h.cleanup()
  assert.equal(h.events.size + h.globalEvents.size + h.documentEvents.size + h.frames.size, 0)
  assert.equal(h.first.properties.size, 0)
  const reduced = harness({ reduced: true })
  reduced.event('pointerover'); reduced.event('pointerdown')
  assert.equal(reduced.frames.size, 0)
  reduced.cleanup()
})
