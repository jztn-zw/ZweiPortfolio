import { createHmac } from 'node:crypto'
import process from 'node:process'

const counters = new Map()
const quotaScript = `
for i = 1, 2 do
  if tonumber(redis.call('GET', KEYS[i]) or '0') >= tonumber(ARGV[i]) then return 0 end
end
for i = 1, 2 do
  if redis.call('INCR', KEYS[i]) == 1 then redis.call('EXPIRE', KEYS[i], ARGV[i + 2]) end
end
return 1
`

function json(body, status = 200) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } })
}

async function allowMessage(request, secret) {
  const now = Date.now()
  const address = (request.headers.get('x-vercel-forwarded-for') || request.headers.get('x-forwarded-for') || 'local').split(',')[0].trim()
  const identity = createHmac('sha256', secret).update(address).digest('hex').slice(0, 32)
  const keys = [`{portfolio-contact}:sender:${Math.floor(now / 600000)}:${identity}`, `{portfolio-contact}:day:${Math.floor(now / 86400000)}`]
  const limits = [3, 50]
  const durations = [1200, 172800]
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const response = await fetch(process.env.UPSTASH_REDIS_REST_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(['EVAL', quotaScript, 2, ...keys, ...limits, ...durations]),
      signal: AbortSignal.timeout(4000),
    })
    const result = await response.json()
    if (!response.ok || result.error || ![0, 1].includes(Number(result.result))) throw new Error('Quota unavailable')
    return Number(result.result) === 1
  }
  // Local development can run without the shared production counter.
  if (process.env.VERCEL) throw new Error('Shared quota unavailable')
  for (const [key, value] of counters) if (value.expires <= now) counters.delete(key)
  if (keys.some((key, index) => (counters.get(key)?.count || 0) >= limits[index])) return false
  keys.forEach((key, index) => counters.set(key, { count: (counters.get(key)?.count || 0) + 1, expires: now + durations[index] * 1000 }))
  return true
}

export default {
  async fetch(request) {
    if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
    if (request.headers.get('origin') !== new URL(request.url).origin) return json({ error: 'Invalid origin' }, 403)
    if (!request.headers.get('content-type')?.startsWith('application/json')) return json({ error: 'Invalid form' }, 400)
    let data
    try {
      const reader = request.body?.getReader()
      if (!reader) return json({ error: 'Missing form' }, 400)
      let body = '', bytes = 0
      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        bytes += value.byteLength
        if (bytes > 24000) { await reader.cancel(); return json({ error: 'Form too large' }, 413) }
        body += decoder.decode(value, { stream: true })
      }
      data = JSON.parse(body + decoder.decode())
    } catch { return json({ error: 'Invalid form' }, 400) }
    if (!data || typeof data !== 'object' || Array.isArray(data)) return json({ error: 'Invalid form' }, 400)
    if (data.website) return json({ error: 'Invalid form' }, 400)
    const email = typeof data.email === 'string' ? data.email.trim() : ''
    const message = typeof data.message === 'string' ? data.message.trim() : ''
    if (typeof data.submissionId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data.submissionId)) return json({ error: 'Invalid submission' }, 400)
    if (email.length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) || message.length < 10 || message.length > 5000) return json({ error: 'Check your email and message' }, 400)
    const key = process.env.RESEND_API_KEY
    const from = process.env.CONTACT_FROM_EMAIL
    const to = process.env.CONTACT_TO_EMAIL
    if (!key || !from || !to) return json({ error: 'Email delivery is being set up' }, 503)
    try {
      if (!await allowMessage(request, key)) return json({ error: 'Please try again later' }, 429)
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'Idempotency-Key': createHmac('sha256', key).update(`${email}:${data.submissionId}`).digest('hex') },
        body: JSON.stringify({ from, to: [to], reply_to: email, subject: 'New portfolio enquiry', text: `Reply to: ${email}\n\n${message}` }),
        signal: AbortSignal.timeout(10000),
      })
      const result = await response.json()
      if (response.status === 401 || response.status === 403) return json({ error: 'Email delivery is being set up' }, 503)
      if (!response.ok || typeof result.id !== 'string' || !result.id) return json({ error: 'Delivery unavailable' }, 502)
      return json({ sent: true })
    } catch { return json({ error: 'Delivery unavailable' }, 503) }
  },
}
