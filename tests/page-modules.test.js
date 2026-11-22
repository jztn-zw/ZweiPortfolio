import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import { test } from 'node:test'
import ts from 'typescript'

const compile = path => ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText
const routes = {}
vm.runInNewContext(compile('../src/lib/routes.ts'), { exports: routes, URL })

test('Minimal defers full-page downloads until activation while retaining Minimal link preloads', async () => {
  const loaded = []
  const images = []
  const api = {}
  class Element {
    constructor(href) { this.href = href }
    closest() { return this }
  }
  vm.runInNewContext(compile('../src/lib/pageModules.ts'), {
    exports: api, Element, URL,
    window: { location: new URL('https://portfolio.test/') },
    require: name => {
      if (name === './routes') return routes
      if (name === 'react-dom') return { preload: href => images.push(href) }
      loaded.push(name)
      return { default() {} }
    },
  })
  const fullLink = new Element('https://portfolio.test/experience')
  api.preloadLinkPage(fullLink)
  api.preloadLinkPage(new Element('https://portfolio.test/experience/skills'))
  api.preloadLinkPage(new Element('https://portfolio.test/#projects'))
  await Promise.resolve()
  assert.deepEqual(loaded, [])
  assert.deepEqual(images, [])
  api.preloadLinkPage(new Element('https://portfolio.test/skills'))
  await Promise.resolve()
  assert.deepEqual(loaded, ['../pages/MinimalSkills'])
  api.preloadLinkPage(fullLink, true)
  await Promise.resolve()
  assert.deepEqual(loaded, ['../pages/MinimalSkills', '../pages/Home', '../components/FullExperienceEffects'])
  assert.deepEqual(images, ['/images/jaztin-portrait.webp'])
  api.preloadLinkPage(new Element('https://portfolio.test/experience/skills'), true)
  await Promise.resolve()
  assert.deepEqual(loaded, ['../pages/MinimalSkills', '../pages/Home', '../components/FullExperienceEffects', '../pages/Skills'])
})
