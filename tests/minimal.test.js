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
const collections = {}, routes = {}
vm.runInNewContext(compile('../src/data/projectCollections.ts'), { exports: collections })
vm.runInNewContext(compile('../src/lib/routes.ts'), { exports: routes, URL })

function renderMinimal(theme, page = 'Minimal', profile = data, pageProps = {}) {
  const layout = {}
  vm.runInNewContext(compile('../src/components/MinimalLayout.tsx'), {
    exports: layout,
    require: name => name === 'react/jsx-runtime' ? jsxRuntime : name === 'lucide-react' ? icons : name === '../data/portfolio' ? data : name === './FooterVerse' ? verse : name === '../hooks/useTheme' ? { __esModule: true, default: () => ({ theme, toggleTheme() {} }) } : {},
  })
  const skills = {}, greenway = {}, vyora = {}
  vm.runInNewContext(compile('../src/data/skills.ts'), { exports: skills })
  vm.runInNewContext(compile('../src/data/greenway.ts'), { exports: greenway, require: () => icons })
  vm.runInNewContext(compile('../src/data/vyora.ts'), { exports: vyora, require: () => icons })
  const projectCard = {}
  vm.runInNewContext(compile('../src/components/MinimalProjectCard.tsx'), {
    exports: projectCard,
    require: name => name === 'react/jsx-runtime' ? jsxRuntime : name === 'lucide-react' ? icons : {},
  })
  const calendar = {}
  vm.runInNewContext(compile('../src/components/MinimalGitHubCalendar.tsx'), {
    exports: calendar,
    require: name => name === 'react/jsx-runtime' ? jsxRuntime : name === 'lucide-react' ? icons : name === 'react' ? React : {},
  })
  const chatDrawer = {}
  vm.runInNewContext(compile('../src/components/MinimalChatOverlay.tsx'), {
    exports: chatDrawer,
    require: name => name === 'react/jsx-runtime' ? jsxRuntime : name === 'lucide-react' ? icons : name === 'react' ? React : {},
  })
  const exports = {}
  const dependencies = {
    react: React,
    'react/jsx-runtime': jsxRuntime,
    'lucide-react': icons,
    '../data/portfolio': profile,
    '../data/skills': skills,
    '../data/greenway': greenway,
    '../data/vyora': vyora,
    '../data/projectCollections': collections,
    '../lib/routes': routes,
    '../components/MinimalLayout': layout,
    '../components/MinimalProjectCard': projectCard,
    '../components/MinimalGitHubCalendar': calendar,
    '../components/MinimalChatOverlay': chatDrawer,
  }
  vm.runInNewContext(compile(`../src/pages/${page}.tsx`), {
    exports, URL,
    require: name => dependencies[name] ?? {},
  })
  return renderToStaticMarkup(React.createElement(exports.default, pageProps))
}

test('minimal view renders the profile, capabilities, and published work in both themes', () => {
  for (const theme of ['light', 'dark']) {
    const html = renderMinimal(theme)
    assert.match(html, /Jaztin Abram Contreras/)
    assert.match(html, /Quezon, Philippines/)
    assert.match(html, /Manuel S. Enverga University/)
    assert.match(html, /href="\/minimal\/projects\/web-mobile"/)
    assert.doesNotMatch(html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1], /<img\b|<video\b/)
    assert.ok(html.includes(`src="${theme === 'light' ? '/brand-mark-light.svg' : '/brand-mark.svg'}"`))
    assert.match(html, /Tools &amp; Experiments/)
    assert.match(html, /id="min-contributions-title"[^>]*>[\s\S]*?GitHub contributions<\/h2>/)
    assert.match(html, /role="status">Loading GitHub contributions…/)
    assert.doesNotMatch(html, /\[PROJECT NAME\]|\[TECH STACK\]/)
    const stackPreview = html.match(/<section\b[^>]*aria-labelledby="min-stack-title"[^>]*>([\s\S]*?)<\/section>/)[1]
    assert.match(stackPreview, /Tech stack<\/h2>/)
    assert.match(stackPreview, /href="\/minimal\/skills"[^>]*>View all/)
    const previewBadges = [...stackPreview.matchAll(/<li><svg\b[\s\S]*?<\/svg>([^<]*)<\/li>/g)].map(match => match[1])
    for (const technology of ['Electron', 'Next.js', 'Tailwind CSS', 'Expo', 'MySQL', 'MongoDB', 'Vercel']) assert.ok(previewBadges.includes(technology), technology)
    for (const [index, featuredCount] of [[0, 8], [1, 8]]) {
      const remaining = data.capabilities[index].technologies.length - featuredCount
      assert.ok(stackPreview.includes(`aria-label="View ${remaining} more ${data.capabilities[index].title.replaceAll('&', '&amp;')} technologies">+${remaining} more</a>`))
    }
    assert.ok(!previewBadges.includes('Electron Forge'))
    assert.ok(html.includes(theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'))
  }
})

test('the résumé links to real contact and project destinations', () => {
  const html = renderMinimal('light')
  assert.match(html, /href="\/experience"[^>]*aria-label="Full experience"[^>]*><svg\b[^>]*>[\s\S]*?<\/svg><\/a>/)
  for (const href of ['/experience', '/minimal/skills', '/minimal/projects', '/minimal/projects/web-mobile', '/minimal/projects/automation', '/minimal/projects/tools', 'https://github.com/jztn-zw']) {
    assert.ok(html.includes(`href="${href}"`), href)
  }
  assert.doesNotMatch(html, /download=|href="#"/)
  assert.match(html, /href="#minimal-content"/)
  assert.match(html, /id="minimal-title"/)
  assert.match(html, /<dialog[^>]*aria-labelledby="resume-email-title"/)
  assert.match(html, /<input[^>]*type="email"[^>]*name="email"/)
  assert.match(html, /<textarea[^>]*name="message"/)
    assert.doesNotMatch(html, /data-minimal-back/, 'the home page does not need a Back control')
  assert.match(html, /<button[^>]*aria-expanded="false" aria-controls="min-chat-conversation">[\s\S]*?<span>Ask me anything<\/span>/)
  assert.doesNotMatch(html, /id="ask-question"/)
})

test('selected work links to three collections while View all shows every listed project', () => {
  const additions = Array.from({ length: 4 }, (_, index) => ({
    ...data.listedProjects[0],
    id: `additional-${index}`,
    title: `Additional project ${index}`,
    artwork: 'structure',
    technologies: [],
    detailsUrl: undefined,
  }))
  const profile = { ...data, listedProjects: [...data.listedProjects, ...additions] }
  for (const theme of ['light', 'dark']) {
    const selected = renderMinimal(theme, 'Minimal', profile)
    assert.equal((selected.match(/class="min-project-summary"/g) ?? []).length, 3)
    assert.equal((selected.match(/aria-labelledby="min-projects-title"/g) ?? []).length, 1)
    assert.match(selected, /href="\/minimal\/projects"/)
    assert.doesNotMatch(selected, /Additional project 3/)
    const gallery = renderMinimal(theme, 'MinimalProjects', profile)
    assert.equal((gallery.match(/class="min-card min-project-card"/g) ?? []).length, profile.listedProjects.length)
    assert.match(gallery, /Additional project 3/)
    assert.match(gallery, /VYORA/)
    assert.match(gallery, /href="\/minimal\/projects\/vyora"/)
    assert.match(gallery, /Live · In development/)
    assert.match(gallery, /Completed/)
    assert.match(gallery, /href="https:\/\/vyorabooth\.vyora\.workers\.dev\/"/)
    assert.match(gallery, /href="https:\/\/greenway-candelaria\.vercel\.app\/"/)
    assert.match(gallery, /id="minimalProjects-title" tabindex="-1"/)
    assert.match(gallery, /href="\/minimal"/)
    assert.match(gallery, /class="min-project-filters"/)
    assert.doesNotMatch(gallery, /data-hover-surface|page-navigation-curtain/)
  }
})

test('individual minimal collection pages show matching projects without the filter badges', () => {
  for (const theme of ['light', 'dark']) {
    for (const [page, collection] of Object.entries(routes.minimalProjectCollectionByPage)) {
      const html = renderMinimal(theme, 'MinimalProjects', data, { page })
      assert.match(html, new RegExp(`id="${page}-title" tabindex="-1"`))
      assert.doesNotMatch(html, /class="min-project-filters"|aria-label="Project collections"/)
      const expected = data.listedProjects.filter(project => project.collection === collection)
      assert.equal((html.match(/class="min-card min-project-card"/g) ?? []).length, expected.length)
      for (const project of data.listedProjects) {
        assert.equal(html.includes(`<h3>${project.title}</h3>`), project.collection === collection)
      }
      assert.equal(html.includes('Projects coming soon'), expected.length === 0)
      assert.match(html, /href="\/minimal"/)
    }
  }
})

test('View all keeps its collection filters while changing the visible projects', () => {
  for (const theme of ['light', 'dark']) {
    for (const collection of collections.projectCollections) {
      const route = `/minimal/projects?filter=${collection.id}#min-project-filters`
      const html = renderMinimal(theme, 'MinimalProjects', data, { page: 'minimalProjects', route })
      assert.match(html, /class="min-project-filters"/)
      assert.ok(html.includes(`href="${route}" aria-current="page"`))
      assert.match(html, /href="\/minimal\/projects#min-project-filters"/)
      for (const project of data.listedProjects) {
        assert.equal(html.includes(`<h3>${project.title}</h3>`), project.collection === collection.id)
      }
    }
    const all = renderMinimal(theme, 'MinimalProjects', data, { route: '/minimal/projects#min-project-filters' })
    for (const project of data.listedProjects) assert.ok(all.includes(`<h3>${project.title}</h3>`))
  }
})

test('first paint preloads the hero only on home and skips full artwork on minimal pages', () => {
  const bootstrap = readFileSync(new URL('../index.html', import.meta.url), 'utf8').match(/<script>([\s\S]*?)<\/script>/)[1]
  for (const [pathname, hash, hero] of [
    ['/minimal', '', false], ['/minimal/', '', false], ['/minimal/skills', '', false],
    ['/minimal/projects/greenway', '', false], ['/minimal/projects/vyora', '', false], ['/minimal/projects', '', false], ['/', '', false], ['/experience', '', true], ['/', '#projects', true],
    ['/minimal/projects/web-mobile', '', false], ['/minimal/projects/automation', '', false], ['/minimal/projects/tools', '', false],
    ['/', '#/skills', false], ['/projects/web-mobile', '', false], ['/numbers', '', false],
    ['/projects/greenway', '#home', true],
  ]) {
    const links = [], dataset = {}
    vm.runInNewContext(bootstrap, {
      location: { pathname, hash }, localStorage: { getItem: () => 'light' },
      document: { documentElement: { dataset }, querySelector: () => ({}), createElement: () => ({}), head: { appendChild: link => links.push(link) } },
    })
    assert.equal(dataset.theme, 'light')
    assert.equal(links.length, pathname.startsWith('/minimal') || (pathname === '/' && !hash) ? 0 : hero ? 3 : 2)
    assert.equal(links.some(link => link.href === '/images/jaztin-portrait.webp'), hero)
    assert.equal(dataset.view === 'minimal', pathname.startsWith('/minimal') || (pathname === '/' && !hash))
  }
})

test('minimal detail pages share navigation and preserve confirmed content in both themes', () => {
  for (const theme of ['light', 'dark']) {
    const stack = renderMinimal(theme, 'MinimalSkills')
    for (const group of data.capabilities) for (const tool of group.technologies) assert.ok(stack.includes(tool), tool)
    assert.match(stack, /href="\/minimal#min-projects-title"/)
    assert.doesNotMatch(stack, /Back to portfolio/)
    assert.match(stack, /id="minimalSkills-title" tabindex="-1"/)
    assert.match(stack, /href="\/skills"[^>]*aria-label="Full experience"/)
    const project = renderMinimal(theme, 'MinimalGreenWay')
    for (const tool of data.projects.find(project => project.artwork === 'greenway').technologies) assert.ok(project.includes(tool), tool)
    assert.match(project, /href="\/minimal\/skills"/)
    assert.doesNotMatch(project, /Back to projects/)
    assert.match(project, /id="minimalGreenway-title" tabindex="-1"/)
    assert.match(project, /href="https:\/\/greenway-candelaria.vercel.app\/"/)
    assert.match(project, /<video[^>]*controls=""[^>]*preload="none"/)
    assert.doesNotMatch(project, /autoPlay|autoplay|\[PROJECT NAME\]/)
    const vyora = renderMinimal(theme, 'MinimalVyora')
    assert.match(vyora, /id="minimalVyora-title" tabindex="-1"/)
    assert.match(vyora, /Live · In development/)
    assert.match(vyora, /href="https:\/\/vyorabooth\.vyora\.workers\.dev\/"/)
    assert.match(vyora, /src="\/images\/vyora-studio.jpg"/)
    assert.match(vyora, /src="\/images\/vyora-website.jpg"/)
    assert.match(vyora, /Online photo uploads and galleries are planned/)
    for (const tool of data.projects.find(project => project.id === 'vyora').technologies) assert.ok(vyora.includes(tool), tool)
    for (const html of [stack, project, vyora, renderMinimal(theme, 'MinimalProjects')]) {
      assert.ok(html.includes(`src="${theme === 'light' ? '/brand-mark-light.svg' : '/brand-mark.svg'}"`))
      assert.match(html, /Philippians 4:13/)
      assert.match(html, /href="\/minimal"/)
      assert.match(html, /Switch to (dark|light) mode/)
      assert.match(html, /<main[^>]*><nav class="min-back-nav" aria-label="Page navigation"><a class="min-text-link min-page-back" href="\/minimal" data-minimal-back="true">[\s\S]*?Back<\/a><\/nav>/)
      assert.doesNotMatch(html, /data-hover-surface|page-navigation-curtain/)
    }
  }
})

test('every skill badge references an available local technology brand symbol', () => {
  const html = renderMinimal('dark', 'MinimalSkills')
  const references = [...html.matchAll(/href="\/tech-icons\.svg#([^"]+)"/g)].map(match => match[1])
  const sprite = readFileSync(new URL('../public/tech-icons.svg', import.meta.url), 'utf8')
  const symbols = new Set([...sprite.matchAll(/<symbol\b[^>]*\bid="([^"]+)"/g)].map(match => match[1]))
  const shownCount = Number(html.match(/(\d+) tools &amp; technologies/)[1])
  assert.equal(references.length, shownCount)
  assert.equal(shownCount, data.capabilities.flatMap(group => group.technologies).length)
  for (const symbol of references) assert.ok(symbols.has(symbol), `Missing brand symbol: ${symbol}`)
  const home = renderMinimal('dark').match(/<section\b[^>]*aria-labelledby="min-stack-title"[^>]*>([\s\S]*?)<\/section>/)[1]
  const homeReferences = [...home.matchAll(/href="\/tech-icons\.svg#([^"]+)"/g)].map(match => match[1])
  assert.equal(homeReferences.length, 21)
  for (const symbol of homeReferences) assert.ok(symbols.has(symbol), `Missing home brand symbol: ${symbol}`)
})
