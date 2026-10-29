import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import vm from 'node:vm'
import { test } from 'node:test'
import * as jsxRuntime from 'react/jsx-runtime'
import { renderToStaticMarkup } from 'react-dom/server'
import ts from 'typescript'

const source = readFileSync(new URL('../src/components/VisitorCounter.tsx', import.meta.url), 'utf8')
const compiled = [false, true].map(development => ts.transpileModule(source.replaceAll('import.meta.env.DEV', String(development)), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2023, jsx: ts.JsxEmit.ReactJSX },
}).outputText)

function renderCounter(count, unavailable = false, development = false) {
  const states = [count, unavailable]
  const exports = {}
  vm.runInNewContext(compiled[Number(development)], {
    exports,
    require: name => {
      if (name === 'react/jsx-runtime') return jsxRuntime
      if (name === '../lib/visitorCount') return { getVisitorCount: () => { throw new Error('Render checks must not call the visitor API') } }
      if (name === 'react') return {
        useState: () => [states.shift(), () => {}],
        useEffect: () => {},
      }
      throw new Error(`Unexpected dependency: ${name}`)
    },
  })
  return renderToStaticMarkup(exports.default())
}

test('visitor avatars grow with the real count, stop at three, and never cap the displayed total', () => {
  for (const count of [0, 1, 2, 3, 4, 1000]) {
    const markup = renderCounter(count)
    const images = [...markup.matchAll(/<img\b[^>]*>/g)].map(match => match[0])
    assert.doesNotMatch(markup, /role="tooltip"|aria-describedby|footer-visitors-tooltip|Decorative anime avatars/)
    assert.equal(images.length, Math.min(count, 3), `avatar count at ${count} visitors`)
    assert.match(markup, new RegExp(`<strong[^>]*>${count.toLocaleString('en-US')}</strong>`))
    if (count > 0) assert.match(markup, /class="footer-visitor-avatars" aria-hidden="true"/)
    for (const image of images) {
      assert.match(image, /alt=""/, 'dummy portraits are decorative, not visitor identities')
      const path = image.match(/src="([^"]+)"/)[1]
      assert.ok(existsSync(new URL(`../public${path}`, import.meta.url)), 'each avatar asset is available locally')
    }
  }
})

test('loading and unavailable counts do not fabricate visitors or avatars', () => {
  for (const unavailable of [false, true]) {
    const markup = renderCounter(null, unavailable)
    assert.doesNotMatch(markup, /<img\b/)
    assert.match(markup, /<strong[^>]*>—<\/strong>/)
    assert.match(markup, unavailable ? /Visitor count is currently unavailable/ : /Loading visitor count/)
  }
})

test('development and production never display sample visitors when no real count is available', () => {
  for (const development of [false, true]) {
    const markup = renderCounter(null, true, development)
    assert.doesNotMatch(markup, /<img\b|footer-visitors-preview|Local design preview|>Sample</)
    assert.match(markup, /<strong[^>]*>—<\/strong>/)
    assert.match(markup, /Visitor count is currently unavailable/)
  }
})
