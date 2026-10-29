import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import { test } from 'node:test'
import ts from 'typescript'

const compiled = ts.transpileModule(readFileSync(new URL('../src/hooks/useProjectRibbon.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2023 },
}).outputText

function harness({ scrollEnd = true, reduced = false, compact = true } = {}) {
  const frames = new Map(), timers = new Map(), listeners = new Map(), effects = [], cleanups = []
  let nextId = 0, firstRef = true, resize, coasting = false, reads = 0
  const writes = []
  const media = { matches: compact, addEventListener() {}, removeEventListener() {} }
  const list = {
    scrollLeft: 0, width: 390, dataset: {},
    children: [0, 296].map(left => ({ getBoundingClientRect: () => { reads++; return { left } } })),
    getBoundingClientRect() { return { width: this.width } },
    scrollTo({ left }) { this.scrollLeft = left; writes.push(left) },
    addEventListener: (name, fn) => listeners.set(name, fn),
    removeEventListener: name => listeners.delete(name),
  }
  if (scrollEnd) list.onscrollend = null
  const exports = {}
  vm.runInNewContext(compiled, {
    exports,
    window: {
      matchMedia: query => query.includes('reduced') ? { matches: reduced } : media,
      addEventListener() {}, removeEventListener() {},
    },
    requestAnimationFrame: fn => { frames.set(++nextId, fn); return nextId },
    cancelAnimationFrame: id => frames.delete(id),
    setTimeout: fn => { timers.set(++nextId, fn); return nextId },
    clearTimeout: id => timers.delete(id),
    ResizeObserver: class { constructor(fn) { resize = fn } observe() {} disconnect() {} },
    require: name => name === 'react' ? {
      useRef: value => {
        if (firstRef) { firstRef = false; return { current: list } }
        return { current: value }
      },
      useState: initial => [typeof initial === 'function' ? initial() : initial, () => {}],
      useCallback: fn => fn,
      useEffect: fn => effects.push(fn),
    } : {
      __esModule: true,
      default: () => ({
        dragging: false, isCoasting: () => coasting, stopMomentum: () => { coasting = false },
        dragHandlers: { onPointerDown() {}, onPointerUp() {}, onPointerCancel() {} },
      }),
    },
  })
  const hook = exports.default(3, 1)
  effects.forEach(fn => { const cleanup = fn(); if (cleanup) cleanups.push(cleanup) })
  return {
    hook, list, frames, timers, writes, media, resize: () => resize(), reads: () => reads,
    coast: value => { coasting = value },
    scroll(left) { list.scrollLeft = left; hook.handlers.onScroll({ currentTarget: list }) },
    end: () => listeners.get('scrollend')(),
    pointer(name) { hook.handlers[name]({ currentTarget: list, pointerType: 'touch' }) },
    flushTimers() { const pending = [...timers.values()]; timers.clear(); pending.forEach(fn => fn()) },
    frame(time) { const pending = [...frames.values()]; frames.clear(); pending.forEach(fn => fn(time)) },
    cleanup() { cleanups.forEach(fn => fn()) },
  }
}

test('a fast native swipe never rebases or auto-centers during momentum', () => {
  const h = harness()
  h.pointer('onPointerDown')
  h.pointer('onPointerCancel') // The browser takes over the touch gesture.
  const before = h.writes.length, reads = h.reads()
  for (const left of [1900, 1400, 800, 250, 125]) {
    h.scroll(left)
    h.flushTimers()
    assert.equal(h.frames.size, 0)
    assert.equal(h.writes.length, before)
  }
  assert.equal(h.reads(), reads, 'scrolling must use cached geometry')
  h.end()
  assert.equal(h.frames.size, 1)
  h.frame(0)
  h.frame(310)
  assert.ok(h.list.scrollLeft > 0 && h.list.scrollLeft < 125)
  h.frame(620)
  assert.equal(h.list.scrollLeft, 6 * 296, 'rebase only after landing on the identical centered card')
  h.end()
  assert.equal(h.frames.size, 0, 'completion must not start another animation')
  h.cleanup()
})

test('a fresh touch interrupts centering and height-only resize leaves a swipe alone', () => {
  const h = harness()
  h.scroll(2200)
  h.end()
  h.frame(0)
  h.frame(100)
  h.pointer('onPointerDown')
  assert.equal(h.frames.size, 0)
  h.scroll(2300)
  const before = h.writes.length
  h.resize()
  assert.equal(h.list.scrollLeft, 2300)
  assert.equal(h.writes.length, before, 'same width must not reset position')
  h.flushTimers()
  assert.equal(h.frames.size, 0)
  h.pointer('onPointerUp')
  h.flushTimers()
  assert.equal(h.frames.size, 1)
  h.cleanup()
  assert.equal(h.frames.size, 0)
  assert.equal(h.timers.size, 0)
})

test('fallback waits for quiet scrolling, and centering never competes with mouse coasting', () => {
  const h = harness({ scrollEnd: false })
  h.coast(true)
  h.scroll(2250)
  h.flushTimers()
  assert.equal(h.frames.size, 0)
  h.coast(false)
  h.scroll(2270)
  h.scroll(2290)
  assert.equal(h.timers.size, 1)
  h.flushTimers()
  assert.equal(h.frames.size, 1)
  h.cleanup()
})

test('desktop remains fixed and reduced motion centers immediately', () => {
  const desktop = harness({ compact: false })
  desktop.scroll(0)
  desktop.flushTimers()
  desktop.end()
  assert.equal(desktop.frames.size, 0)
  assert.equal(desktop.list.scrollLeft, 0)
  desktop.cleanup()
  const reduced = harness({ reduced: true })
  reduced.scroll(2250)
  reduced.end()
  assert.equal(reduced.frames.size, 0)
  assert.equal(reduced.list.scrollLeft, 8 * 296)
  reduced.cleanup()
})
