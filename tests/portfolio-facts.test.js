import assert from 'node:assert/strict'
import { test } from 'node:test'
import chat from '../server/chat.js'
import { portfolioInstructions } from '../server/portfolioContext.js'

test('current project and contact FAQs work without provider or Redis calls', async () => {
  const original = globalThis.fetch
  globalThis.fetch = () => { throw new Error('FAQ must not use external services') }
  try {
    for (const [question, expected] of [['VYORA', /Live.*In development/], ['Everwell', /Workflow draft/], ['resume', /JaztinAbramContrerasCV.pdf/], ['LinkedIn', /jaztin-abram-contreras/], ['list your projects', /VYORA/]]) {
      const response = await chat.fetch(new Request('https://portfolio.test/api/chat', {
        method: 'POST', headers: { origin: 'https://portfolio.test', 'content-type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: question }] }),
      }))
      assert.equal(response.status, 200)
      const output = await response.text()
      assert.match(output, /"provider":"portfolio"/)
      assert.match(output, expected)
      assert.match(output, /"type":"done"/)
    }
  } finally { globalThis.fetch = original }
})

test('model context includes live projects and current contact facts', () => {
  assert.match(portfolioInstructions, /VYORA/)
  assert.match(portfolioInstructions, /Everwell/)
  assert.match(portfolioInstructions, /Workflow draft/)
  assert.match(portfolioInstructions, /JaztinAbramContrerasCV.pdf/)
  assert.doesNotMatch(portfolioInstructions, /resume is not yet available|LinkedIn has not been supplied/)
})
