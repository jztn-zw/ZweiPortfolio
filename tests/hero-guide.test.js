import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import { test } from 'node:test'
import ts from 'typescript'

const compiled = ts.transpileModule(readFileSync(new URL('../src/lib/heroGuide.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2023 },
}).outputText
function load(storage = new Map(), blocked = false) {
  const exports = {}
  vm.runInNewContext(compiled, {
    exports,
    sessionStorage: {
      getItem: key => { if (blocked) throw Error('Blocked'); return storage.get(key) },
      setItem: (key, value) => { if (blocked) throw Error('Blocked'); storage.set(key, value) },
    },
    require: () => ({ portfolio: { shortName: 'Jaztin' } }),
  })
  return exports
}
test('a walkthrough marked on entry stays suppressed across reloads within its tab session', () => {
  const session = new Map()
  const firstLoad = load(session)
  assert.equal(firstLoad.hasSeenHeroGuide(), false)
  firstLoad.markHeroGuideSeen()
  assert.equal(firstLoad.hasSeenHeroGuide(), true)
  assert.equal(load(session).hasSeenHeroGuide(), true, 'reload must not replay a partial or dismissed tour')
  assert.equal(load(new Map()).hasSeenHeroGuide(), false, 'a new session can receive the introduction')
})
test('storage restrictions keep an in-memory guard without breaking the page', () => {
  const guide = load(new Map(), true)
  assert.equal(guide.hasSeenHeroGuide(), false)
  guide.markHeroGuideSeen()
  assert.equal(guide.hasSeenHeroGuide(), true)
})
test('the message and pointer stay inside narrow, short and desktop viewports', () => {
  const { placeHeroGuide } = load()
  for (const viewport of [{ width: 320, height: 568, top: 85 }, { width: 390, height: 720, top: 85 }, { width: 1440, height: 900, top: 100 }]) {
    const panel = { width: Math.min(246, viewport.width - 32), height: 95 }
    for (const target of [{ left: 20, right: viewport.width - 20, top: 150, bottom: 240 }, { left: viewport.width - 150, right: viewport.width + 20, top: 500, bottom: 650 }]) {
      const result = placeHeroGuide(target, panel, viewport)
      assert.ok(result.left >= 16)
      assert.ok(result.left + panel.width <= viewport.width - 16)
      assert.ok(result.top >= viewport.top)
      assert.ok(result.top + panel.height <= viewport.height - 16)
      assert.ok(result.pointerX <= viewport.width - 24)
      assert.ok(result.pointerY <= viewport.height - 28)
    }
  }
})

test('the portrait pointer aims into the rendered illustration after accounting for letterboxing', () => {
  const { placeHeroGuide, heroGuidePortraitBounds, heroGuidePortraitAim } = load()
  for (const container of [{ left: 790, top: 110, right: 1300, bottom: 755 }, { left: 700, top: 100, right: 1050, bottom: 800 }]) {
    const art = heroGuidePortraitBounds(container)
    assert.ok(art.left >= container.left && art.right <= container.right)
    assert.ok(art.top >= container.top && art.bottom <= container.bottom)
    assert.ok(Math.abs((art.right - art.left) / (art.bottom - art.top) - 941 / 1672) < .0001)
    const result = placeHeroGuide(art, { width: 246, height: 95 }, { width: 1440, height: 900, top: 100 }, heroGuidePortraitAim)
    assert.equal(result.pointerX, art.left + (art.right - art.left) * .79)
    assert.equal(result.pointerY, art.top + (art.bottom - art.top) * .61)
  }
})

test('each hero action has its own explanation and a cursor inside its bottom-right corner', () => {
  const { heroGuideSteps, placeHeroGuide } = load()
  assert.ok(heroGuideSteps.find(step => step.target === '[data-guide="contact"]'))
  assert.ok(heroGuideSteps.find(step => step.target === '[data-guide="resume"]'))
  for (const target of [{ left: 30, right: 180, top: 500, bottom: 546 }, { left: 192, right: 340, top: 500, bottom: 546 }]) {
    const result = placeHeroGuide(target, { width: 228, height: 90 }, { width: 390, height: 720, top: 85 })
    assert.equal(result.pointerX, target.right - 10)
    assert.equal(result.pointerY, target.bottom - 6.9)
  }
})

test('a compact chat bubble stays attached to each top-bar cursor, including near the right edge', () => {
  const { placeHeroGuide } = load()
  for (const width of [320, 390, 1440]) {
    const panel = { width: width < 560 ? 228 : 246, height: 80 }
    for (const offset of [44, 98, 152, 206, 260]) {
      const right = width - offset
      const result = placeHeroGuide({ left: right - 36, right, top: 14, bottom: 58 }, panel, { width, height: 720, top: 12 })
      const gapX = Math.max(result.left - result.pointerX, result.pointerX - (result.left + panel.width), 0)
      assert.ok(gapX <= 16, 'bubble must stay beside the pointer instead of anchoring to a distant target corner')
      assert.equal(result.top, result.pointerY + 28)
      assert.ok(result.left >= 16 && result.left + panel.width <= width - 16)
    }
  }
})
