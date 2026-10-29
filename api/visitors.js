import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto'
import process from 'node:process'

const cookieName = '__Host-portfolio-visitor'
const retentionSeconds = 365 * 24 * 60 * 60
const totalKey = '{portfolio-visitors}:total'
const incrementScript = `
local count = tonumber(redis.call('GET', KEYS[2]) or '0')
if redis.call('SET', KEYS[1], '1', 'NX', 'EX', ARGV[1]) then
  count = redis.call('INCR', KEYS[2])
else
  redis.call('EXPIRE', KEYS[1], ARGV[1])
end
return count
`

function sign(id, secret) {
  return createHmac('sha256', secret).update(id).digest('base64url')
}

function visitorId(request, secret) {
  const value = (request.headers.get('cookie') || '').split(';')
    .map(part => part.trim()).find(part => part.startsWith(`${cookieName}=`))
    ?.slice(cookieName.length + 1)
  if (!value) return randomUUID()
  const [id, signature, extra] = value.split('.')
  if (extra || !/^[a-f0-9-]{36}$/.test(id) || !/^[A-Za-z0-9_-]{43}$/.test(signature || '')) return randomUUID()
  const expected = Buffer.from(sign(id, secret))
  const supplied = Buffer.from(signature)
  return expected.length === supplied.length && timingSafeEqual(expected, supplied) ? id : randomUUID()
}

function json(body, status = 200, extraHeaders = {}) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store', ...extraHeaders } })
}

export default {
  async fetch(request) {
    if (request.method !== 'GET' && request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405, { Allow: 'GET, POST' })
    }
    if (request.method === 'POST' && request.headers.get('origin') !== new URL(request.url).origin) {
      return json({ error: 'Invalid request origin' }, 403)
    }

    const endpoint = process.env.UPSTASH_REDIS_REST_URL
    const token = process.env.UPSTASH_REDIS_REST_TOKEN
    // Preview deployments and local development must not inflate the live total.
    if (process.env.VERCEL_ENV !== 'production' || !endpoint || !token) {
      return json({ error: 'Visitor count unavailable' }, 503)
    }

    try {
      const secret = process.env.VISITOR_COOKIE_SECRET || token
      const id = request.method === 'POST' ? visitorId(request, secret) : null
      const command = id
        ? ['EVAL', incrementScript, 2, `{portfolio-visitors}:browser:${id}`, totalKey, retentionSeconds]
        : ['GET', totalKey]
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(command),
        signal: AbortSignal.timeout(5000),
      })
      if (!response.ok) throw new Error('Storage request failed')
      const data = await response.json()
      if (data.error) throw new Error('Storage command failed')
      const count = data.result === null && !id ? 0 : Number(data.result)
      if (!Number.isSafeInteger(count) || count < 0 || (id && count === 0)) throw new Error('Invalid count')

      const headers = id ? {
        'Set-Cookie': `${cookieName}=${id}.${sign(id, secret)}; Path=/; Max-Age=${retentionSeconds}; HttpOnly; Secure; SameSite=Lax`,
      } : {}
      return json({ count }, 200, headers)
    } catch {
      // Do not expose database URLs, credentials, or upstream error messages.
      return json({ error: 'Visitor count unavailable' }, 503)
    }
  },
}
