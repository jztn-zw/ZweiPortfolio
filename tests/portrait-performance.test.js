import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import { test } from 'node:test'
import * as React from 'react'
import * as jsxRuntime from 'react/jsx-runtime'
import { renderToStaticMarkup } from 'react-dom/server'
import ts from 'typescript'

const compiled = ts.transpileModule(readFileSync(new URL('../src/components/PortraitReveal.tsx', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText
const masks = {}
vm.runInNewContext(ts.transpileModule(readFileSync(new URL('../src/lib/portraitMask.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports: masks })
function portrait(mode, reduced = false) {
  const exports = {}
  vm.runInNewContext(compiled, {
    exports, document: { documentElement: { dataset: { effects: mode } } },
    window: { matchMedia: () => ({ matches: reduced }) },
    require: name => name === 'react' ? React : name === 'react/jsx-runtime' ? jsxRuntime : name === '../lib/portraitMask' ? masks : {},
  })
  return renderToStaticMarkup(React.createElement(exports.default))
}

test('constrained hardware retains the same full portrait reveal, fragments and photo', () => {
  for (const mode of ['full', 'lite']) {
    const html = portrait(mode)
    assert.match(html, /portrait-pixel/)
    assert.match(html, /portrait-glitch/)
    assert.match(html, /portrait-reveal-defs/)
    assert.doesNotMatch(html, /portrait-reveal--lite/)
    assert.match(html, /jaztin-portrait-real-matched.webp/)
    assert.match(html, /portrait-reveal-backdrop/)
    assert.match(html, /aria-pressed="false"/)
    assert.ok((html.match(/class="portrait-pixel"/g) ?? []).length < 510, 'batch the mask geometry rather than remove the reveal')
  }
})

test('mask batching preserves every cell coordinate, edge size and opacity timing', () => {
  const size = 56
  const tiles = Array.from({ length: 510 }, (_, index) => {
    const column = index % 17, row = Math.floor(index / 17)
    return { x: column * size, y: row * size, delay: Math.round(Math.max(0, Math.min(1, (row * size - 220) / 1200)) * 1000) + ((column * 13 + row * 11) % 7) * 7 }
  })
  const grouped = masks.groupMaskTiles(tiles, size)
  const actual = new Map()
  for (const group of grouped) {
    for (const cell of group.path.matchAll(/M(\d+) (\d+)h56v56h-56z/g)) {
      const key = `${cell[1]}:${cell[2]}`
      assert.equal(actual.has(key), false, 'each cell must be drawn exactly once')
      actual.set(key, group.delay)
    }
  }
  assert.equal(actual.size, 510)
  for (const tile of tiles) assert.equal(actual.get(`${tile.x}:${tile.y}`), tile.delay)
  assert.ok(grouped.length < tiles.length / 2)
})

test('an explicit reduced-motion preference still uses the accessible crossfade', () => {
  const html = portrait('full', true)
  assert.match(html, /portrait-reveal--lite/)
  assert.doesNotMatch(html, /portrait-pixel|portrait-glitch|portrait-reveal-defs/)
})
