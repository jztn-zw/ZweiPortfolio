import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import { test } from 'node:test'
import ts from 'typescript'

const compiled = ts.transpileModule(readFileSync(new URL('../src/lib/devicePerformance.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText
const api = {}
vm.runInNewContext(compiled, { exports: api })

test('constrained hardware, data saving, compact touch and reduced motion select lighter effects', () => {
  for (const hints of [{ cores: 4 }, { memory: 2 }, { saveData: true }, { reducedMotion: true }, { coarsePointer: true, width: 390 }]) {
    assert.equal(api.chooseEffectsMode(hints), 'lite', JSON.stringify(hints))
  }
  assert.equal(api.chooseEffectsMode({ cores: 8, memory: 8, width: 1440 }), 'full')
  assert.equal(api.chooseEffectsMode({}), 'full', 'missing optional hardware APIs must not break the page')
  assert.equal(api.chooseEffectsMode({ width: 800, coarsePointer: false, cores: 8 }), 'full', 'a resized desktop window alone is not low-end hardware')
})

test('initialization sets quality before mounting and supports browsers without memory or connection APIs', () => {
  const exports = {}, document = { documentElement: { dataset: {} } }
  vm.runInNewContext(compiled, {
    exports, document, navigator: { hardwareConcurrency: 2 },
    window: { innerWidth: 1280, matchMedia: () => ({ matches: false }) },
  })
  exports.initializeEffectsMode()
  assert.equal(document.documentElement.dataset.effects, 'lite')
})
