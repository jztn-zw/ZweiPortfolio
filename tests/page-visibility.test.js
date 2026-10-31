import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import { test } from 'node:test'
import ts from 'typescript'

const compiled = ts.transpileModule(readFileSync(new URL('../src/lib/pageVisibility.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText
function harness({ supported = true, initiallyCovered = false } = {}) {
  const exports = {}, notifications = [], listeners = new Map()
  const document = { hidden: false, documentElement: { dataset: initiallyCovered ? { pageTransition: 'active' } : {} }, addEventListener: (name, fn) => listeners.set(name, fn), removeEventListener: name => listeners.delete(name) }
  let callback, options, disconnected = false
  class Observer {
    constructor(fn) { callback = fn }
    observe(target, settings) { assert.equal(target, document.documentElement); options = settings }
    disconnect() { disconnected = true }
  }
  vm.runInNewContext(compiled, { exports, document, ...(supported ? { MutationObserver: Observer } : {}) })
  const stop = exports.observePageCover(covered => notifications.push(covered))
  return { document, notifications, listeners, stop, changed: () => callback(), get options() { return options }, get disconnected() { return disconnected } }
}

test('covered-page rendering pauses once and resumes only when all overlays have finished', () => {
  const h = harness(), flags = h.document.documentElement.dataset
  assert.deepEqual(h.notifications, [false])
  flags.pageTransition = 'active'; h.changed(); h.changed()
  assert.deepEqual(h.notifications, [false, true], 'duplicate mutations must not restart animation clocks')
  flags.themeTransition = 'reveal'; h.changed()
  delete flags.pageTransition; h.changed()
  assert.deepEqual(h.notifications, [false, true], 'the remaining theme overlay still covers the renderer')
  delete flags.themeTransition; h.changed()
  assert.deepEqual(h.notifications, [false, true, false])
  assert.deepEqual(Array.from(h.options.attributeFilter), ['data-page-transition', 'data-theme-transition'])
  h.stop()
})

test('hidden tabs pause work; newly mounted content starts paused under an existing transition', () => {
  const h = harness({ initiallyCovered: true })
  assert.deepEqual(h.notifications, [true])
  h.document.hidden = true
  h.listeners.get('visibilitychange')()
  delete h.document.documentElement.dataset.pageTransition; h.changed()
  assert.deepEqual(h.notifications, [true])
  h.document.hidden = false; h.listeners.get('visibilitychange')()
  assert.deepEqual(h.notifications, [true, false])
  h.stop()
})

test('cleanup disconnects observation and blocks late callbacks from restarting an unmounted renderer', () => {
  const h = harness()
  h.stop()
  assert.equal(h.disconnected, true)
  assert.equal(h.listeners.size, 0)
  h.document.documentElement.dataset.pageTransition = 'active'
  h.changed()
  assert.deepEqual(h.notifications, [false])
})

test('a browser without mutation observation never leaves the renderer permanently paused', () => {
  const h = harness({ supported: false, initiallyCovered: true })
  assert.deepEqual(h.notifications, [false])
  h.stop()
})
