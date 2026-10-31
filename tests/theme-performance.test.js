import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import { test } from 'node:test'
import ts from 'typescript'

const compiled = ts.transpileModule(readFileSync(new URL('../src/hooks/useTheme.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText
function harness({ lite = true, reduced = false, supported = true } = {}) {
  const animations = [], transitions = [], properties = new Map()
  let gridReveals = 0
  const root = {
    dataset: { effects: lite ? 'lite' : 'full', theme: 'dark' },
    style: { setProperty: (key, value) => properties.set(key, value), removeProperty: key => properties.delete(key) },
    animate(frames, options) {
      const animation = { frames, options, cancelled: false, cancel() { this.cancelled = true } }
      animations.push(animation)
      return animation
    },
  }
  const document = {
    documentElement: root, querySelector: () => null,
    startViewTransition: supported ? callback => {
      callback()
      let finish
      const transition = { ready: Promise.resolve(), finished: new Promise(resolve => { finish = resolve }), skipTransition: () => finish(), finish: () => finish() }
      transitions.push(transition)
      return transition
    } : undefined,
  }
  const exports = {}
  vm.runInNewContext(compiled, {
    exports, document, Event: class {}, localStorage: { setItem() {} },
    CSS: { supports: () => true },
    window: { innerWidth: 1200, innerHeight: 800, matchMedia: () => ({ matches: reduced }), dispatchEvent() {}, setTimeout: () => 1, clearTimeout() {} },
    require: name => name === 'react' ? { useSyncExternalStore: (_, snapshot) => snapshot() }
      : name === 'react-dom' ? { flushSync: callback => callback() }
      : name === './pageNavigation' ? { cancelPageNavigation() {} }
      : { themeRevealDuration: 900, createThemeReveal: () => { gridReveals++; return [{ '--theme-reveal-radius': '0px' }, { '--theme-reveal-radius': '1400px' }] } },
  })
  return { root, animations, transitions, properties, toggle: exports.default().toggleTheme, get gridReveals() { return gridReveals } }
}
const settle = async () => { await Promise.resolve(); await Promise.resolve() }

test('minimal themes reveal the entire viewport with one circle and clean up after completion', async () => {
  const h = harness()
  h.root.dataset.view = 'minimal'
  h.toggle({ x: 1190, y: 10 })
  await settle()
  assert.equal(h.root.dataset.theme, 'light')
  assert.equal(h.root.dataset.themeTransition, 'circle')
  assert.equal(h.gridReveals, 0)
  assert.equal(h.animations.length, 1)
  assert.equal(h.animations[0].options.pseudoElement, '::view-transition-new(root)')
  const radius = Number(h.animations[0].frames[1].clipPath.match(/circle\((\d+)px/)[1])
  assert.ok(radius >= Math.hypot(1190, 790), 'the furthest corner must be covered')
  h.transitions[0].finish()
  await settle()
  assert.equal(h.root.dataset.themeTransition, undefined)
  assert.equal(h.properties.size, 0)
  assert.equal(h.animations[0].cancelled, true)
})

test('rapid minimal theme toggles cancel the old animation and preserve the latest transition', async () => {
  const h = harness()
  h.root.dataset.view = 'minimal'
  h.toggle(); await settle()
  h.toggle(); await settle()
  assert.equal(h.animations[0].cancelled, true)
  assert.equal(h.root.dataset.theme, 'dark')
  assert.equal(h.root.dataset.themeTransition, 'circle')
  assert.equal(h.animations[1].cancelled, false)
  h.transitions[1].finish(); await settle()
})

test('minimal view uses the simple circular theme reveal even on powerful devices', async () => {
  const h = harness({ lite: false })
  h.root.dataset.view = 'minimal'
  h.toggle(); await settle()
  assert.equal(h.gridReveals, 0)
  assert.equal(h.root.dataset.themeTransition, 'circle')
  h.transitions[0].finish(); await settle()
})

test('full experience retains its pixel reveal on devices using lighter rendering elsewhere', async () => {
  const h = harness({ lite: true })
  h.root.dataset.view = 'home'
  h.toggle(); await settle()
  assert.equal(h.gridReveals, 1)
  assert.equal(h.root.dataset.themeTransition, 'reveal')
  h.transitions[0].finish(); await settle()
})

test('full devices keep the pixel reveal; reduced motion and unsupported browsers remain functional', async () => {
  const full = harness({ lite: false })
  full.toggle(); await settle()
  assert.equal(full.gridReveals, 1)
  assert.equal(full.root.dataset.themeTransition, 'reveal')
  full.transitions[0].finish(); await settle()
  for (const options of [{ reduced: true }, { supported: false }]) {
    const h = harness(options)
    h.toggle(); await settle()
    assert.equal(h.root.dataset.theme, 'light')
    assert.equal(h.animations.length, 0)
  }
})
