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

function renderMinimal(theme, page = 'Minimal') {
  const layout = {}
  vm.runInNewContext(compile('../src/components/MinimalLayout.tsx'), {
    exports: layout,
    require: name => name === 'react/jsx-runtime' ? jsxRuntime : name === 'lucide-react' ? icons : name === '../data/portfolio' ? data : name === './FooterVerse' ? verse : name === '../hooks/useTheme' ? { __esModule: true, default: () => ({ theme, toggleTheme() {} }) } : {},
  })
  const skills = {}, greenway = {}
  vm.runInNewContext(compile('../src/data/skills.ts'), { exports: skills })
  vm.runInNewContext(compile('../src/data/greenway.ts'), { exports: greenway, require: () => icons })
  const exports = {}
  vm.runInNewContext(compile(`../src/pages/${page}.tsx`), {
    exports,
    require: name => name === 'react' ? React : name === 'react/jsx-runtime' ? jsxRuntime : name === 'lucide-react' ? icons : name === '../data/portfolio' ? data : name === '../data/skills' ? skills : name === '../data/greenway' ? greenway : name === '../components/MinimalLayout' ? layout : {},
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
  for (const href of ['/', '/minimal/skills', '/ask-ai', '/minimal/projects/greenway', 'https://greenway-candelaria.vercel.app/', 'https://github.com/jztn-zw', 'mailto:jaztinabramcontreras@gmail.com']) {
    assert.ok(html.includes(`href="${href}"`), href)
  }
  assert.match(html, /<button[^>]*disabled=""[^>]*>.*?Resume/s)
  assert.doesNotMatch(html, /download=|href="#"/)
  assert.match(html, /href="#minimal-content"/)
  assert.match(html, /id="minimal-title"/)
})

test('minimal first paint does not preload the full experience portrait or pixel textures', () => {
  const bootstrap = readFileSync(new URL('../index.html', import.meta.url), 'utf8').match(/<script>([\s\S]*?)<\/script>/)[1]
  for (const pathname of ['/minimal', '/minimal/', '/minimal/skills', '/minimal/skills/', '/minimal/projects/greenway', '/']) {
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

test('minimal detail pages share navigation and preserve confirmed content in both themes', () => {
  for (const theme of ['light', 'dark']) {
    const stack = renderMinimal(theme, 'MinimalSkills')
    for (const group of data.capabilities) for (const tool of group.technologies) assert.ok(stack.includes(tool), tool)
    assert.match(stack, /href="\/minimal\/projects\/greenway"/)
    assert.match(stack, /href="\/minimal#min-stack-title"/)
    assert.match(stack, /id="minimalSkills-title" tabindex="-1"/)
    assert.match(stack, /href="\/skills"[^>]*aria-label="Full experience"/)
    const project = renderMinimal(theme, 'MinimalGreenWay')
    for (const tool of data.projects.find(project => project.artwork === 'greenway').technologies) assert.ok(project.includes(tool), tool)
    assert.match(project, /href="\/minimal\/skills"/)
    assert.match(project, /href="\/minimal#min-projects-title"/)
    assert.match(project, /id="minimalGreenway-title" tabindex="-1"/)
    assert.match(project, /href="https:\/\/greenway-candelaria.vercel.app\/"/)
    assert.match(project, /<video[^>]*controls=""[^>]*preload="none"/)
    assert.doesNotMatch(project, /autoPlay|autoplay|\[PROJECT NAME\]/)
    for (const html of [stack, project]) {
      assert.match(html, /Philippians 4:13/)
      assert.match(html, /href="\/minimal"/)
      assert.match(html, /Switch to (dark|light) mode/)
      assert.doesNotMatch(html, /data-hover-surface|page-navigation-curtain/)
    }
  }
})
