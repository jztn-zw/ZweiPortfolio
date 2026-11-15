import assert from 'node:assert/strict'
import { test } from 'node:test'
import process from 'node:process'
import handler from '../api/contact.js'

function setEnv(t, name, value) {
  const previous = process.env[name]
  process.env[name] = value
  t.after(() => { if (previous === undefined) delete process.env[name]; else process.env[name] = previous })
}

const valid = { email: 'visitor@example.com', message: 'I would like to discuss a website project.', submissionId: 'fd7a6143-f4b4-4311-8f55-53853c0959e5' }
function request(body = valid, origin = 'https://portfolio.example') {
  return new Request('https://portfolio.example/api/contact', { method: 'POST', headers: { origin, 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
}

test('contact validates requests and configuration before making external calls', async t => {
  t.mock.method(globalThis, 'fetch', async () => { throw new Error('Unexpected network request') })
  setEnv(t, 'RESEND_API_KEY', '')
  assert.equal((await handler.fetch(new Request('https://portfolio.example/api/contact'))).status, 405)
  assert.equal((await handler.fetch(request(valid, 'https://other.example'))).status, 403)
  for (const body of [null, {}, { ...valid, email: 'invalid' }, { ...valid, message: 'short' }, { ...valid, website: 'spam' }, { ...valid, message: 'x'.repeat(25000) }]) {
    assert.ok([400, 413].includes((await handler.fetch(request(body))).status))
  }
  assert.equal((await handler.fetch(request())).status, 503)
  assert.equal(globalThis.fetch.mock.callCount(), 0)
})

test('contact sends only to the configured inbox with reply-to and a stable retry key', async t => {
  setEnv(t, 'RESEND_API_KEY', 'test-only-key')
  setEnv(t, 'CONTACT_FROM_EMAIL', 'Jaztin <contact@example.com>')
  setEnv(t, 'CONTACT_TO_EMAIL', 'owner@example.com')
  setEnv(t, 'UPSTASH_REDIS_REST_URL', 'https://counter.example')
  setEnv(t, 'UPSTASH_REDIS_REST_TOKEN', 'test-counter')
  const sends = []
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    if (url === 'https://counter.example') return Response.json({ result: 1 })
    assert.equal(url, 'https://api.resend.com/emails')
    sends.push(options)
    return Response.json({ id: 'test-email' })
  })
  for (let i = 0; i < 2; i++) assert.deepEqual(await (await handler.fetch(request({ ...valid, to: 'attacker@example.com' }))).json(), { sent: true })
  const payload = JSON.parse(sends[0].body)
  assert.deepEqual(payload.to, ['owner@example.com'])
  assert.equal(payload.reply_to, valid.email)
  assert.ok(payload.text.includes(valid.message))
  assert.equal(sends[0].headers['Idempotency-Key'], sends[1].headers['Idempotency-Key'])
})

test('quota and provider failures do not claim success or expose provider details', async t => {
  setEnv(t, 'RESEND_API_KEY', 'test-only-key')
  setEnv(t, 'CONTACT_FROM_EMAIL', 'contact@example.com')
  setEnv(t, 'CONTACT_TO_EMAIL', 'owner@example.com')
  setEnv(t, 'UPSTASH_REDIS_REST_URL', 'https://counter.example')
  setEnv(t, 'UPSTASH_REDIS_REST_TOKEN', 'test-counter')
  let allowed = false
  t.mock.method(globalThis, 'fetch', async url => url === 'https://counter.example' ? Response.json({ result: allowed ? 1 : 0 }) : Response.json({ error: 'private provider details' }, { status: 403 }))
  assert.equal((await handler.fetch(request())).status, 429)
  allowed = true
  const result = await handler.fetch(request())
  assert.equal(result.status, 503)
  assert.deepEqual(await result.json(), { error: 'Email delivery is being set up' })
})
