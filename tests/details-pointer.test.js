import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import { test } from 'node:test'
import ts from 'typescript'

const compiled = ts.transpileModule(readFileSync(new URL('../src/hooks/useDetailsPointer.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2023 },
}).outputText

function harness(reduced = false) {
  const events = new Map(), globalEvents = new Map(), frames = new Map(), properties = new Map(), animations = []
  let cleanup, nextFrame = 0, time = 0, preferenceChanged
  const motion = { matches: reduced, addEventListener: (_, callback) => { preferenceChanged = callback }, removeEventListener: () => { preferenceChanged = undefined } }
  const pulse = { animate: () => { const animation = { cancelled: false, cancel() { this.cancelled = true } }; animations.push(animation); return animation } }
  const panel = {
    dataset: {}, style: { setProperty: (key, value) => properties.set(key, value), removeProperty: key => properties.delete(key) },
    querySelector: () => pulse,
    getBoundingClientRect: () => ({ left: 100, top: 200, width: 600, height: 300 }),
    addEventListener: (name, callback, options) => { assert.equal(options.passive, true); events.set(name, callback) },
    removeEventListener: name => events.delete(name),
  }
  const exports = {}
  vm.runInNewContext(compiled, {
    exports,
    window: { matchMedia: () => motion, addEventListener: (name, callback) => globalEvents.set(name, callback), removeEventListener: name => globalEvents.delete(name) },
    requestAnimationFrame: callback => { frames.set(++nextFrame, callback); return nextFrame },
    cancelAnimationFrame: id => frames.delete(id),
    require: () => ({ useRef: () => ({ current: panel }), useEffect: callback => { cleanup = callback() } }),
  })
  exports.default()
  return {
    panel, events, globalEvents, properties, frames, animations, cleanup: () => cleanup(),
    event(name, overrides = {}) { events.get(name)({ clientX: 180, clientY: 260, pointerType: 'mouse', button: 0, isPrimary: true, ...overrides }) },
    step() { time += 16; const pending = [...frames.values()]; frames.clear(); pending.forEach(callback => callback(time)) },
    reduceMotion() { motion.matches = true; preferenceChanged() },
  }
}

test('pointer updates coalesce into one frame and stop scheduling once settled', () => {
  const h = harness()
  h.event('pointerenter')
  assert.equal(h.properties.get('--details-pointer-x'), '80.00px')
  for (let index = 0; index < 12; index++) h.event('pointermove', { clientX: 300 + index })
  assert.equal(h.frames.size, 1)
  h.step()
  assert.ok(parseFloat(h.properties.get('--details-pointer-x')) > 80)
  assert.ok(parseFloat(h.properties.get('--details-pointer-x')) < 211)
  for (let index = 0; index < 60 && h.frames.size; index++) h.step()
  assert.equal(h.properties.get('--details-pointer-x'), '211.00px')
  assert.equal(h.frames.size, 0, 'an idle pointer should not run an animation loop')
  h.event('pointermove', { clientX: 10000, clientY: 10000 })
  for (let index = 0; index < 60 && h.frames.size; index++) h.step()
  const markerX = parseFloat(h.properties.get('--details-marker-x'))
  const markerY = parseFloat(h.properties.get('--details-marker-y'))
  assert.ok(markerX >= 0 && markerX + 50 <= 600, 'the segmented marker must stay inside the panel horizontally')
  assert.ok(markerY >= 0 && markerY + 50 <= 300, 'the segmented marker must stay inside the panel vertically')
  assert.equal(h.properties.get('--details-pointer-turn'), '0.00deg', 'the ring should settle rather than rotate forever')
  h.event('pointermove')
  h.event('pointerleave')
  assert.equal(h.frames.size, 0)
  assert.equal(h.panel.dataset.pointerActive, undefined)
  h.cleanup()
})

test('touch activates only on press and yields to scrolling or release', () => {
  const h = harness()
  h.event('pointerenter', { pointerType: 'touch' })
  assert.equal(h.panel.dataset.pointerActive, undefined)
  h.event('pointerdown', { pointerType: 'touch' })
  assert.equal(h.panel.dataset.pointerActive, 'true')
  assert.equal(h.animations.length, 1)
  h.event('pointermove', { pointerType: 'touch', clientY: 285 })
  assert.equal(h.panel.dataset.pointerActive, undefined)
  h.event('pointermove', { pointerType: 'touch', clientY: 300 })
  assert.equal(h.panel.dataset.pointerActive, undefined, 'scrolling must not reactivate the decoration')
  h.event('pointerdown', { pointerType: 'touch' })
  h.event('pointerup', { pointerType: 'touch' })
  assert.equal(h.frames.size, 0)
  h.cleanup()
})

test('secondary pointers are ignored and reduced motion disables and cancels effects', () => {
  const h = harness()
  h.event('pointerdown', { isPrimary: false })
  h.event('pointerdown', { button: 2 })
  assert.equal(h.frames.size, 0)
  h.event('pointerdown')
  h.reduceMotion()
  assert.equal(h.frames.size, 0)
  assert.equal(h.panel.dataset.pointerActive, undefined)
  assert.equal(h.animations[0].cancelled, true)
  h.event('pointermove')
  h.event('pointerdown')
  assert.equal(h.frames.size, 0)
  assert.equal(h.animations.length, 1)
  h.cleanup()
  const initiallyReduced = harness(true)
  initiallyReduced.event('pointerenter')
  assert.equal(initiallyReduced.frames.size, 0)
  initiallyReduced.cleanup()
})

test('scroll and unmount remove the active effect and all scheduled work', () => {
  const h = harness()
  h.event('pointerenter')
  h.globalEvents.get('scroll')()
  assert.equal(h.frames.size, 0)
  assert.equal(h.panel.dataset.pointerActive, undefined)
  h.event('pointerdown')
  h.cleanup()
  assert.equal(h.animations[0].cancelled, true)
  assert.equal(h.frames.size, 0)
  assert.equal(h.events.size, 0)
  assert.equal(h.globalEvents.size, 0)
  assert.equal(h.properties.size, 0)
})
