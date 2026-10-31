import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import { test } from 'node:test'
import ts from 'typescript'

function harness() {
  const exports = {}, frames = new Map()
  let id = 0
  vm.runInNewContext(ts.transpileModule(readFileSync(new URL('../src/lib/frameTask.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, {
    exports, requestAnimationFrame: fn => { frames.set(++id, fn); return id }, cancelAnimationFrame: id => frames.delete(id),
  })
  return { ...exports, frames, paint() { const queued = [...frames.values()]; frames.clear(); queued.forEach(fn => fn()) } }
}

test('bursts of scroll and resize events run layout measurement once per frame', () => {
  const h = harness()
  let reads = 0
  const task = h.createFrameTask(() => reads++)
  for (let index = 0; index < 200; index++) task.schedule()
  assert.equal(h.frames.size, 1)
  assert.equal(reads, 0)
  h.paint()
  assert.equal(reads, 1)
  assert.equal(h.frames.size, 0)
  task.schedule(); h.paint()
  assert.equal(reads, 2)
})

test('cancellation prevents late layout reads and permits a later scheduled measurement', () => {
  const h = harness()
  let reads = 0
  const task = h.createFrameTask(() => reads++)
  task.schedule(); task.cancel(); h.paint()
  assert.equal(reads, 0)
  task.schedule(); h.paint()
  assert.equal(reads, 1)
})

test('60fps scheduling preserves cadence across different display refresh rates and long pauses', () => {
  const h = harness(), interval = 1000 / 60
  for (const refresh of [60, 90, 120, 144]) {
    let deadline = 0, draws = 0
    for (let index = 0; index < refresh; index++) {
      const now = index * 1000 / refresh
      if (now + .5 < deadline) continue
      draws++
      deadline = h.advanceFrameDeadline(now, deadline, interval)
    }
    assert.ok(draws >= 59 && draws <= 61, `${refresh}Hz: ${draws} SVG updates`)
  }
  const resumed = h.advanceFrameDeadline(8000, 20, interval)
  assert.ok(resumed > 8000 && resumed <= 8000 + interval)
  assert.equal(h.advanceFrameDeadline(8000, 20, 0), 0)
})
