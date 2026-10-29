import assert from 'node:assert/strict'
import { beforeEach, afterEach, test, mock } from 'node:test'
import process from 'node:process'
import visitors from '../api/visitors.js'

const origin = 'https://portfolio.example'
let count
let browsers
let commands

function request(method = 'POST', cookie) {
  return new Request(`${origin}/api/visitors`, {
    method,
    headers: { Origin: origin, ...(cookie ? { Cookie: cookie } : {}) },
  })
}

beforeEach(() => {
  process.env.VERCEL_ENV = 'production'
  process.env.UPSTASH_REDIS_REST_URL = 'https://redis.example'
  process.env.UPSTASH_REDIS_REST_TOKEN = 'test-only-token'
  process.env.VISITOR_COOKIE_SECRET = 'test-only-signing-secret'
  count = 0
  browsers = new Set()
  commands = []
  mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, 'https://redis.example')
    assert.equal(options.headers.Authorization, 'Bearer test-only-token')
    const command = JSON.parse(options.body)
    commands.push(command)
    if (command[0] === 'GET') return Response.json({ result: count || null })
    assert.equal(command[0], 'EVAL')
    assert.equal(command[2], 2)
    assert.equal(command[4], '{portfolio-visitors}:total')
    assert.equal(command[5], 31536000)
    if (!browsers.has(command[3])) {
      browsers.add(command[3])
      count += 1
    }
    return Response.json({ result: count })
  })
})

afterEach(() => { mock.restoreAll() })

test('first visit counts once; reloads and concurrent requests with the same cookie do not inflate it', async () => {
  const first = await visitors.fetch(request())
  assert.equal(first.status, 200)
  assert.deepEqual(await first.json(), { count: 1 })
  assert.equal(first.headers.get('cache-control'), 'no-store')
  const setCookie = first.headers.get('set-cookie')
  assert.match(setCookie, /HttpOnly; Secure; SameSite=Lax/)
  const cookie = setCookie.split(';')[0]
  const repeats = await Promise.all(Array.from({ length: 5 }, () => visitors.fetch(request('POST', cookie))))
  for (const response of repeats) assert.deepEqual(await response.json(), { count: 1 })
  const anotherBrowser = await visitors.fetch(request())
  assert.deepEqual(await anotherBrowser.json(), { count: 2 })
})

test('GET reads the total without counting the reader or setting a cookie', async () => {
  const empty = await visitors.fetch(request('GET'))
  assert.deepEqual(await empty.json(), { count: 0 })
  assert.equal(empty.headers.has('set-cookie'), false)
  await visitors.fetch(request())
  const current = await visitors.fetch(request('GET'))
  assert.deepEqual(await current.json(), { count: 1 })
  assert.equal(browsers.size, 1)
})

test('a tampered cookie cannot reuse another browser identity', async () => {
  const first = await visitors.fetch(request())
  const cookie = first.headers.get('set-cookie').split(';')[0]
  const tampered = cookie.slice(0, -1) + (cookie.endsWith('x') ? 'y' : 'x')
  const response = await visitors.fetch(request('POST', tampered))
  assert.deepEqual(await response.json(), { count: 2 })
  assert.notEqual(commands[0][3], commands[1][3])
})

test('cross-origin and originless writes are rejected before accessing storage', async () => {
  for (const headers of [{ Origin: 'https://other.example' }, {}]) {
    const response = await visitors.fetch(new Request(`${origin}/api/visitors`, { method: 'POST', headers }))
    assert.equal(response.status, 403)
  }
  assert.equal(commands.length, 0)
})

test('preview deployments and missing configuration never increment production data', async () => {
  process.env.VERCEL_ENV = 'preview'
  assert.equal((await visitors.fetch(request())).status, 503)
  process.env.VERCEL_ENV = 'production'
  delete process.env.UPSTASH_REDIS_REST_TOKEN
  assert.equal((await visitors.fetch(request())).status, 503)
  assert.equal(commands.length, 0)
})

test('storage failures do not return a fabricated count, visitor cookie, or upstream secrets', async () => {
  globalThis.fetch.mock.mockImplementation(async () => Response.json({ error: 'private-storage-error' }))
  const response = await visitors.fetch(request())
  assert.equal(response.status, 503)
  assert.equal(response.headers.has('set-cookie'), false)
  assert.deepEqual(await response.json(), { error: 'Visitor count unavailable' })
})

test('unsupported methods do not access storage', async () => {
  const response = await visitors.fetch(request('DELETE'))
  assert.equal(response.status, 405)
  assert.equal(response.headers.get('allow'), 'GET, POST')
  assert.equal(commands.length, 0)
})
