import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import { test } from 'node:test'
import * as React from 'react'
import * as jsxRuntime from 'react/jsx-runtime'
import { renderToStaticMarkup } from 'react-dom/server'
import ts from 'typescript'

const compiled = ts.transpileModule(readFileSync(new URL('../src/components/PortraitReveal.tsx', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText
function portrait(mode) {
  const exports = {}
  vm.runInNewContext(compiled, {
    exports, document: { documentElement: { dataset: { effects: mode } } },
    window: { matchMedia: () => ({ matches: false }) },
    require: name => name === 'react' ? React : name === 'react/jsx-runtime' ? jsxRuntime : {},
  })
  return renderToStaticMarkup(React.createElement(exports.default))
}

test('lite portrait omits the thousand-cell mask and fragments instead of just hiding them', () => {
  const full = portrait('full'), lite = portrait('lite')
  assert.ok((full.match(/<rect\b/g) ?? []).length > 1000)
  assert.ok((lite.match(/<rect\b/g) ?? []).length < 10)
  assert.doesNotMatch(lite, /portrait-pixel|portrait-glitch|portrait-reveal-defs/)
  assert.match(lite, /portrait-reveal--lite/)
  assert.match(lite, /jaztin-portrait-real-matched.webp/)
  assert.match(lite, /portrait-reveal-backdrop/)
  assert.match(lite, /aria-pressed="false"/)
})
