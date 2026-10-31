import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import { test } from 'node:test'
import * as React from 'react'
import * as jsxRuntime from 'react/jsx-runtime'
import * as icons from 'lucide-react'
import { renderToStaticMarkup } from 'react-dom/server'
import ts from 'typescript'

const compile = path => ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText
const data = {}
vm.runInNewContext(compile('../src/data/portfolio.ts'), { exports: data })
const verse = {}
vm.runInNewContext(compile('../src/components/FooterVerse.tsx'), { exports: verse, require: name => name === 'react' ? React : name === 'react/jsx-runtime' ? jsxRuntime : name === '../data/portfolio' ? data : {} })

function renderMinimal(theme) {
  const exports = {}
  vm.runInNewContext(compile('../src/pages/Minimal.tsx'), {
    exports,
    require: name => name === 'react' ? React : name === 'react/jsx-runtime' ? jsxRuntime : name === 'lucide-react' ? icons : name === '../data/portfolio' ? data : name === '../components/FooterVerse' ? verse : name === '../hooks/useTheme' ? { __esModule: true, default: () => ({ theme, toggleTheme() {} }) } : {},
  })
  return renderToStaticMarkup(React.createElement(exports.default))
}

test('minimal view renders confirmed profile, capabilities and published work in both themes', () => {
  for (const theme of ['light', 'dark']) {
    const html = renderMinimal(theme)
    assert.match(html, /Jaztin Abram Contreras/)
    assert.match(html, /Sariaya, Quezon, Philippines/)
    assert.match(html, /Manuel S. Enverga University/)
    assert.match(html, /GreenWay/)
    assert.match(html, /Completed/)
    assert.doesNotMatch(html, /\[PROJECT NAME\]|\[TECH STACK\]/)
    for (const group of data.capabilities) for (const technology of group.technologies) assert.ok(html.includes(technology))
    assert.ok(html.includes(theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'))
  }
})

test('minimal links use real destinations and the unavailable resume does not pretend to download', () => {
  const html = renderMinimal('light')
  for (const href of ['/', '/skills', '/ask-ai', '/projects/greenway', 'https://greenway-candelaria.vercel.app/', 'https://github.com/jztn-zw', 'mailto:jaztinabramcontreras@gmail.com']) {
    assert.ok(html.includes(`href="${href}"`), href)
  }
  assert.match(html, /<button[^>]*disabled=""[^>]*>.*?Resume/s)
  assert.doesNotMatch(html, /download=|href="#"/)
  assert.match(html, /href="#minimal-content"/)
  assert.match(html, /id="minimal-title"/)
})

test('minimal first paint does not preload the full experience portrait or pixel textures', () => {
  const bootstrap = readFileSync(new URL('../index.html', import.meta.url), 'utf8').match(/<script>([\s\S]*?)<\/script>/)[1]
  for (const pathname of ['/minimal', '/minimal/', '/']) {
    const links = [], dataset = {}
    vm.runInNewContext(bootstrap, {
      location: { pathname }, localStorage: { getItem: () => 'light' },
      document: { documentElement: { dataset }, querySelector: () => ({}), createElement: () => ({}), head: { appendChild: link => links.push(link) } },
    })
    assert.equal(dataset.theme, 'light')
    assert.equal(links.length, pathname.startsWith('/minimal') ? 0 : 3)
    assert.equal(dataset.view === 'minimal', pathname.startsWith('/minimal'))
  }
})
