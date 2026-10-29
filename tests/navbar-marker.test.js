import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import { test } from 'node:test'
import ts from 'typescript'

const source = readFileSync(new URL('../src/components/FloatingNavbar.tsx', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2023, jsx: ts.JsxEmit.ReactJSX },
}).outputText

function harness(activeIndex = 0) {
  class Element {
    constructor(index, unavailable = false) {
      this.offsetLeft = index * 53
      this.offsetWidth = this.offsetHeight = 44
      this.unavailable = unavailable
    }
    closest() { return this }
    getAttribute(name) { return name === 'aria-disabled' && this.unavailable ? 'true' : null }
  }
  const items = [new Element(0), new Element(1, true), new Element(2, true), new Element(3)]
  const listeners = new Map(), frames = new Map(), properties = new Map()
  const nav = {
    dataset: {},
    style: { setProperty: (key, value) => properties.set(key, value) },
    contains: target => items.includes(target),
    querySelector: () => items[activeIndex],
    addEventListener: (name, handler) => listeners.set(name, handler),
    removeEventListener: name => listeners.delete(name),
  }
  const document = { activeElement: null }
  let cleanup, nextFrame = 0
  const exports = {}
  vm.runInNewContext(compiled, {
    exports, document, Element,
    requestAnimationFrame: handler => { frames.set(++nextFrame, handler); return nextFrame },
    cancelAnimationFrame: id => frames.delete(id),
    ResizeObserver: class { observe() {} disconnect() {} },
    require: name => name === 'react' ? {
      useRef: () => ({ current: nav }),
      useEffect: effect => { cleanup = effect() },
    } : name === 'react/jsx-runtime' ? { jsx: () => null, jsxs: () => null } : {},
  })
  exports.default({ isHome: activeIndex === 0, isNumbers: activeIndex === 3 })
  return {
    items, document, listeners, cleanup: () => cleanup(),
    marker: () => properties.get('--nav-marker-x'),
    fire: (name, target) => listeners.get(name)({ target, pointerType: 'mouse' }),
    frame() { const pending = [...frames.values()]; frames.clear(); pending.forEach(handler => handler()) },
  }
}

test('leaving or clicking a coming-soon item restores the current page marker despite retained focus', () => {
  for (const activeIndex of [0, 3]) for (const unavailableIndex of [1, 2]) {
    const h = harness(activeIndex)
    const activeX = `${activeIndex * 53}px`
    assert.equal(h.marker(), activeX)
    h.fire('pointerover', h.items[unavailableIndex])
    assert.equal(h.marker(), `${unavailableIndex * 53}px`, 'hover may preview the unavailable item')
    h.document.activeElement = h.items[unavailableIndex]
    h.fire('pointerleave')
    assert.equal(h.marker(), activeX, 'retained button focus must not trap the marker')
    h.fire('pointerover', h.items[unavailableIndex])
    h.fire('click', h.items[unavailableIndex])
    assert.equal(h.marker(), activeX, 'clicking a coming-soon item returns to the actual page')
    assert.equal(h.document.activeElement, h.items[unavailableIndex], 'keyboard focus remains intact')
    h.cleanup()
    assert.equal(h.listeners.size, 0)
  }
})

test('keyboard navigation still previews available pages and returns to the active page after focus leaves', () => {
  const h = harness()
  h.document.activeElement = h.items[3]
  h.fire('focusin', h.items[3])
  h.frame()
  assert.equal(h.marker(), '159px')
  h.document.activeElement = h.items[1]
  h.fire('focusin', h.items[1])
  h.frame()
  assert.equal(h.marker(), '0px')
  h.document.activeElement = null
  h.fire('focusout', h.items[1])
  h.frame()
  assert.equal(h.marker(), '0px')
  h.cleanup()
})
