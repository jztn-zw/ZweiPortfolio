import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import { test } from 'node:test'
import ts from 'typescript'

const compiled = ts.transpileModule(readFileSync(new URL('../src/lib/startupScreen.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2023 },
}).outputText

function harness({ reduced = false, decode = () => Promise.resolve(), fonts = Promise.resolve(), imageCount = 1 } = {}) {
  const timers = new Map(), frames = [], listeners = new Map()
  const attributes = new Map(), properties = new Map(), status = { textContent: '' }
  const progress = { style: { setProperty: (name, value) => properties.set(name, value) }, setAttribute: (name, value) => attributes.set(name, value) }
  let nextId = 0, inert = true, removed = 0, leaving = false
  const screen = {
    querySelector: selector => selector === '[data-startup-progress]' ? progress : status,
    classList: { add: () => { leaving = true } }, remove: () => { removed++ },
    addEventListener: (name, fn) => listeners.set(name, fn), removeEventListener: name => listeners.delete(name),
  }
  const exports = {}
  vm.runInNewContext(compiled, {
    exports,
    document: {
      getElementById: id => id === 'root' ? { removeAttribute: () => { inert = false } } : screen,
      querySelectorAll: () => Array.from({ length: imageCount }, () => ({ decode })), fonts: { ready: fonts },
    },
    window: { matchMedia: () => ({ matches: reduced }) },
    requestAnimationFrame: fn => { frames.push(fn) },
    setTimeout: (fn, delay) => { timers.set(++nextId, { fn, delay }); return nextId },
    clearTimeout: id => timers.delete(id),
  })
  return {
    start: exports.finishStartup, timers, frames, attributes, properties, status,
    state: () => ({ inert, removed, leaving }),
    paint() { while (frames.length) frames.shift()() },
    timer(delay) { const item = [...timers].find(([, timer]) => timer.delay === delay); assert.ok(item); timers.delete(item[0]); item[1].fn() },
    end() { listeners.get('transitionend')({ target: screen, propertyName: 'clip-path' }) },
  }
}
const microtasks = async () => { for (let i = 0; i < 10; i++) await Promise.resolve() }

test('a ready page reveals without a minimum countdown and duplicate mounts do not restart it', async () => {
  const h = harness()
  h.start()
  h.start()
  assert.equal(h.timers.size, 0, 'there is no countdown timer controlling readiness')
  await microtasks()
  assert.equal(h.timers.size, 0)
  assert.equal(h.properties.get('--boot-progress'), '1')
  assert.equal(h.attributes.get('aria-valuenow'), h.attributes.get('aria-valuemax'))
  assert.equal(h.state().inert, true)
  h.paint()
  assert.equal(h.state().inert, false)
  assert.equal(h.state().leaving, true)
  h.end()
  assert.equal(h.state().removed, 1)
  assert.equal(h.timers.size, 0)
})

test('progress only advances when actual assets settle and pending images cannot be skipped by a timer', async () => {
  let resolveImage
  const image = new Promise(resolve => { resolveImage = resolve })
  const h = harness({ decode: () => image })
  h.start()
  assert.equal(h.attributes.get('aria-valuenow'), '1', 'the route commit is the first real milestone')
  await microtasks()
  assert.equal(h.attributes.get('aria-valuenow'), '2', 'only fonts are ready so far')
  assert.equal(h.attributes.get('aria-valuemax'), '3')
  assert.equal(h.status.textContent, 'PREPARING VISUALS')
  assert.equal(h.frames.length, 0)
  assert.equal(h.timers.size, 0, 'a slow image never causes an automatic early reveal')
  resolveImage()
  await microtasks()
  assert.equal(h.status.textContent, 'READY TO EXPLORE')
  h.paint()
  h.timer(600)
  assert.equal(h.state().inert, false)
  assert.equal(h.state().removed, 1)
})

test('failed images and reduced motion reveal the page without animation', async () => {
  const h = harness({ reduced: true, decode: () => Promise.reject(new Error('Image unavailable')) })
  h.start()
  await microtasks()
  h.paint()
  assert.equal(h.state().inert, false)
  assert.equal(h.state().removed, 1)
  assert.equal(h.state().leaving, false)
  assert.equal(h.timers.size, 0)
  assert.equal(h.status.textContent, 'READY · SOME IMAGES UNAVAILABLE')
})

test('a direct page with no eager images still waits for real font readiness', async () => {
  let resolveFonts
  const h = harness({ imageCount: 0, fonts: new Promise(resolve => { resolveFonts = resolve }) })
  h.start()
  await microtasks()
  assert.equal(h.frames.length, 0)
  assert.equal(h.attributes.get('aria-valuemax'), '2')
  resolveFonts()
  await microtasks()
  h.paint()
  assert.equal(h.state().leaving, true)
  h.end()
  assert.equal(h.state().removed, 1)
})
