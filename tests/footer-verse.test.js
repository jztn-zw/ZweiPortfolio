import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import { test } from 'node:test'
import * as jsxRuntime from 'react/jsx-runtime'
import ts from 'typescript'

function compile(path) {
  return ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2023, jsx: ts.JsxEmit.ReactJSX },
  }).outputText
}
const component = compile('../src/components/FooterVerse.tsx')
const data = {}
vm.runInNewContext(compile('../src/data/portfolio.ts'), { exports: data })

function harness() {
  class Node {}
  const inside = new Node(), outside = new Node()
  const root = { contains: target => target === inside }
  const ref = { current: root }
  const listeners = new Map()
  let open = false, previous, cleanup
  const exports = {}
  vm.runInNewContext(component, {
    exports, Node,
    document: {
      addEventListener: (name, handler) => listeners.set(name, handler),
      removeEventListener: name => listeners.delete(name),
    },
    require: name => {
      if (name === 'react/jsx-runtime') return jsxRuntime
      if (name === '../data/portfolio') return data
      if (name.endsWith('.css')) return {}
      if (name === 'react') return {
        useId: () => 'footer-verse-test',
        useRef: () => ref,
        useState: () => [open, next => { open = typeof next === 'function' ? next(open) : next }],
        useEffect: (effect, [value]) => {
          if (value === previous) return
          cleanup?.()
          previous = value
          cleanup = effect()
        },
      }
      throw new Error(`Unexpected import: ${name}`)
    },
  })
  const tree = () => exports.default()
  tree()
  return {
    inside, outside, listeners, tree,
    button: () => tree().props.children[0],
    enter: pointerType => tree().props.onPointerEnter({ pointerType }),
    leave: pointerType => tree().props.onPointerLeave({ pointerType }),
    blur: target => tree().props.onBlur({ currentTarget: root, relatedTarget: target }),
    cleanup: () => cleanup?.(),
  }
}

test('desktop hover and keyboard focus reveal the verse, with Escape and blur dismissing it', () => {
  const h = harness()
  assert.equal(h.button().props.children, 'Philippians 4:13')
  assert.equal(h.button().props['aria-expanded'], false)
  h.enter('mouse')
  assert.equal(h.button().props['aria-expanded'], true)
  const tooltip = h.tree().props.children[1]
  assert.equal(tooltip.props.id, h.button().props['aria-describedby'])
  assert.equal(tooltip.props.children[1].props.children.join(''), `“${data.contactContent.footerVerse.text}”`)
  h.leave('mouse')
  assert.equal(h.button().props['aria-expanded'], false)
  h.button().props.onFocus({ currentTarget: { matches: () => true } })
  assert.equal(h.button().props['aria-expanded'], true)
  h.listeners.get('keydown')({ key: 'Escape' })
  assert.equal(h.button().props['aria-expanded'], false)
  h.enter('mouse')
  h.tree()
  h.blur(h.inside)
  assert.equal(h.button().props['aria-expanded'], true)
  h.blur(h.outside)
  assert.equal(h.button().props['aria-expanded'], false)
  assert.equal(h.listeners.size, 0)
})

test('touch opens on tap rather than pointer entry and supports repeat and outside taps', () => {
  const h = harness()
  h.enter('touch')
  assert.equal(h.button().props['aria-expanded'], false)
  h.button().props.onFocus({ currentTarget: { matches: () => false } })
  h.button().props.onClick()
  h.leave('touch')
  assert.equal(h.button().props['aria-expanded'], true)
  h.listeners.get('pointerdown')({ target: h.inside })
  assert.equal(h.button().props['aria-expanded'], true)
  h.button().props.onClick()
  assert.equal(h.button().props['aria-expanded'], false)
  h.button().props.onClick()
  h.tree()
  h.listeners.get('pointerdown')({ target: h.outside })
  assert.equal(h.button().props['aria-expanded'], false)
  h.button().props.onClick()
  h.tree()
  h.cleanup()
  assert.equal(h.listeners.size, 0)
})
