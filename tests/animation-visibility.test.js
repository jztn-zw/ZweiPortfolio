import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import { test } from 'node:test'
import ts from 'typescript'

const source = readFileSync(new URL('../src/hooks/useAnimationVisibility.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText

test('offscreen animation timelines pause, resume when visible and clean up on navigation', () => {
  const root = new Map(), flags = new Map(), listeners = new Map()
  let notify, cleanup, disconnected = false
  const artwork = { toggleAttribute: (key, enabled) => enabled ? flags.set(key, true) : flags.delete(key), removeAttribute: key => flags.delete(key) }
  const document = {
    hidden: false,
    querySelectorAll: () => [artwork],
    documentElement: { toggleAttribute: (key, enabled) => enabled ? root.set(key, true) : root.delete(key), removeAttribute: key => root.delete(key) },
    addEventListener: (name, callback) => listeners.set(name, callback),
    removeEventListener: name => listeners.delete(name),
  }
  const exports = {}
  vm.runInNewContext(compiled, {
    exports, document,
    IntersectionObserver: class {
      constructor(callback) { notify = callback }
      observe(target) { assert.equal(target, artwork) }
      disconnect() { disconnected = true }
    },
    require: name => name === 'react' ? { useEffect: callback => { cleanup = callback() } } : {},
  })
  exports.default('home')
  notify([{ target: artwork, isIntersecting: false }])
  assert.equal(flags.has('data-animation-paused'), true)
  notify([{ target: artwork, isIntersecting: true }])
  assert.equal(flags.size, 0)
  document.hidden = true
  listeners.get('visibilitychange')()
  assert.equal(root.has('data-tab-hidden'), true)
  document.hidden = false
  listeners.get('visibilitychange')()
  assert.equal(root.size, 0)
  notify([{ target: artwork, isIntersecting: false }])
  cleanup()
  assert.equal(flags.size, 0)
  assert.equal(listeners.size, 0)
  assert.equal(disconnected, true)
})
