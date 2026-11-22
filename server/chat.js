import { createHmac } from 'node:crypto'
import process from 'node:process'
import { portfolioInstructions } from './portfolioContext.js'
import { localPortfolioReply } from './chatScope.js'
import { portfolioFactReply } from './portfolioFacts.js'

const encoder = new TextEncoder()
const localCounters = new Map()
const cooldowns = new Map()
const prefix = '{portfolio-ai}'
const quotaScript = `
for i, key in ipairs(KEYS) do
  if tonumber(redis.call('GET', key) or '0') >= tonumber(ARGV[i]) then return 0 end
end
for i, key in ipairs(KEYS) do
  if redis.call('INCR', key) == 1 then redis.call('EXPIRE', key, ARGV[i + 3]) end
end
return 1
`

class ChatError extends Error {
  constructor(code, retryable = false, retryAfter = 0) {
    super(code)
    this.code = code
    this.retryable = retryable
    this.retryAfter = retryAfter
  }
}

function configured() {
  return [
    { name: 'gemini', key: process.env.GEMINI_API_KEY?.trim(), model: process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite' },
    { name: 'groq', key: process.env.GROQ_API_KEY?.trim(), model: process.env.GROQ_MODEL || 'qwen/qwen3.8-27b' },
  ].filter(provider => provider.key && !provider.key.startsWith('your_'))
}

function hasStorage() { return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) }
function hosted() { return Boolean(process.env.VERCEL_ENV || process.env.VERCEL) }
function event(value) { return encoder.encode(`data: ${JSON.stringify(value)}\n\n`) }
function json(value, status = 200) { return Response.json(value, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } }) }

async function redis(command) {
  const response = await fetch(process.env.UPSTASH_REDIS_REST_URL, {
    method: 'POST', headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command), signal: AbortSignal.timeout(4000),
  })
  if (!response.ok) throw new ChatError('unavailable')
  const data = await response.json()
  if (data.error) throw new ChatError('unavailable')
  return data.result
}

async function rateLimit(request) {
  const now = Date.now(), minute = Math.floor(now / 60000), day = Math.floor(now / 86400000)
  const secret = process.env.AI_RATE_LIMIT_SECRET || process.env.VISITOR_COOKIE_SECRET || process.env.UPSTASH_REDIS_REST_TOKEN || 'local-development'
  const ip = hosted() ? (request.headers.get('x-vercel-forwarded-for') || request.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim() : 'local'
  const identity = createHmac('sha256', secret).update(ip).digest('hex').slice(0, 32)
  const keys = [`${prefix}:minute:${minute}:${identity}`, `${prefix}:minute:${minute}:all`, `${prefix}:day:${day}:all`]
  const limits = [5, 12, 100]
  if (hasStorage()) {
    if (Number(await redis(['EVAL', quotaScript, 3, ...keys, ...limits, 120, 120, 172800])) !== 1) throw new ChatError('rate_limit')
  } else {
    if (hosted()) throw new ChatError('unavailable')
    for (const [key, value] of localCounters) if (value.expires <= now) localCounters.delete(key)
    if (keys.some((key, index) => (localCounters.get(key)?.count || 0) >= limits[index])) throw new ChatError('rate_limit')
    keys.forEach((key, index) => {
      const previous = localCounters.get(key)
      localCounters.set(key, { count: (previous?.count || 0) + 1, expires: previous?.expires || now + (index === 2 ? 86400000 : 60000) })
    })
  }
}

function cooldownKey(provider) {
  const identity = createHmac('sha256', provider.key).update(provider.model).digest('hex').slice(0, 12)
  return `${prefix}:cooldown:${provider.name}:${identity}`
}
async function cooling(provider) {
  const key = cooldownKey(provider)
  if ((cooldowns.get(key) || 0) > Date.now()) return true
  return hasStorage() && Number(await redis(['GET', key])) > Date.now()
}
async function cool(provider, seconds) {
  const key = cooldownKey(provider), duration = Math.max(1, Math.min(86400, seconds || 60)), until = Date.now() + duration * 1000
  cooldowns.set(key, until)
  if (hasStorage()) await redis(['SET', key, until, 'EX', Math.ceil(duration)])
}

export async function validateChatRequest(request) {
  if (!request.headers.get('content-type')?.startsWith('application/json')) throw new ChatError('invalid_request')
  const reader = request.body?.getReader()
  if (!reader) throw new ChatError('invalid_request')
  let size = 0, body = ''
  const decoder = new TextDecoder()
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > 16000) { await reader.cancel(); throw new ChatError('invalid_request') }
      body += decoder.decode(value, { stream: true })
    }
    body += decoder.decode()
  } finally { reader.releaseLock() }
  let messages
  try { messages = JSON.parse(body).messages } catch { throw new ChatError('invalid_request') }
  if (!Array.isArray(messages) || !messages.length || messages.length > 9 || messages.length % 2 === 0) throw new ChatError('invalid_request')
  let total = 0
  for (const [index, message] of messages.entries()) {
    const role = index % 2 === 0 ? 'user' : 'assistant'
    if (!message || message.role !== role || typeof message.content !== 'string' || !message.content.trim() || message.content.length > (role === 'user' ? 500 : 4000)) throw new ChatError('invalid_request')
    total += message.content.length
  }
  if (total > 10000) throw new ChatError('invalid_request')
  return messages.map(({ role, content }) => ({ role, content: content.trim() }))
}

// Decode actual provider SSE events, including split UTF-8 characters and CRLF.
export async function* readProviderEvents(body) {
  const reader = body.getReader(), decoder = new TextDecoder()
  let buffer = ''
  function parse(block) {
    const data = block.split('\n').filter(line => line.startsWith('data:')).map(line => line.slice(5).trimStart()).join('\n')
    if (!data || data === '[DONE]') return null
    return JSON.parse(data)
  }
  try {
    while (true) {
      const { done, value } = await reader.read()
      buffer = (buffer + decoder.decode(value, { stream: !done })).replaceAll('\r\n', '\n')
      let separator
      while ((separator = buffer.indexOf('\n\n')) !== -1) {
        const data = parse(buffer.slice(0, separator))
        buffer = buffer.slice(separator + 2)
        if (data) yield data
      }
      if (buffer.length > 200000) throw new ChatError('unavailable', true)
      if (done) { if (buffer.trim()) { const data = parse(buffer); if (data) yield data }; break }
    }
  } finally { await reader.cancel().catch(() => {}); reader.releaseLock() }
}

async function* generate(provider, messages, signal) {
  const gemini = provider.name === 'gemini'
  const endpoint = gemini ? `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(provider.model)}:streamGenerateContent?alt=sse` : 'https://api.groq.com/openai/v1/chat/completions'
  const response = await fetch(endpoint, {
    method: 'POST', signal,
    headers: { 'Content-Type': 'application/json', ...(gemini ? { 'x-goog-api-key': provider.key } : { Authorization: `Bearer ${provider.key}` }) },
    body: JSON.stringify(gemini ? {
      systemInstruction: { parts: [{ text: portfolioInstructions }] },
      contents: messages.map(message => ({ role: message.role === 'assistant' ? 'model' : 'user', parts: [{ text: message.content }] })),
      generationConfig: { maxOutputTokens: 512, temperature: .2 },
    } : { model: provider.model, messages: [{ role: 'system', content: portfolioInstructions }, ...messages], max_completion_tokens: 512, temperature: .2, stream: true }),
  })
  if (!response.ok) {
    const retry = response.headers.get('retry-after')
    const seconds = retry && /^\d+(\.\d+)?$/.test(retry) ? Number(retry) : retry ? Math.max(1, (Date.parse(retry) - Date.now()) / 1000) : 60
    await response.body?.cancel()
    throw new ChatError(response.status === 429 ? 'rate_limit' : [400, 401, 403, 404].includes(response.status) ? 'configuration' : 'unavailable', response.status === 429 || response.status >= 500, Number.isFinite(seconds) ? seconds : 60)
  }
  if (!response.body) throw new ChatError('unavailable', true)
  for await (const data of readProviderEvents(response.body)) {
    if (data.error) throw new ChatError('unavailable', true)
    if (gemini) {
      const candidate = data.candidates?.[0]
      if (data.promptFeedback?.blockReason || (candidate?.finishReason && !['STOP', 'MAX_TOKENS'].includes(candidate.finishReason))) throw new ChatError('blocked')
      const text = candidate?.content?.parts?.filter(part => !part.thought && typeof part.text === 'string').map(part => part.text).join('')
      if (text) yield text
    } else {
      const choice = data.choices?.[0]
      if (choice?.finish_reason === 'content_filter') throw new ChatError('blocked')
      const text = choice?.delta?.content
      if (typeof text === 'string' && text) yield text
    }
  }
}

export default {
  async fetch(request) {
    const providers = configured()
    if (request.method === 'GET') return json({ available: providers.length > 0 && (!hosted() || hasStorage()), providers: providers.map(provider => provider.name) })
    if (request.method !== 'POST') return json({ code: 'method_not_allowed' }, 405)
    if (request.headers.get('origin') !== new URL(request.url).origin) return json({ code: 'invalid_origin' }, 403)
    let messages
    try { messages = await validateChatRequest(request) } catch { return json({ code: 'invalid_request' }, 400) }
    const local = localPortfolioReply(messages) ?? portfolioFactReply(messages)
    if (local !== null) {
      // Rejections and acknowledgements spend no provider or shared AI quota.
      return new Response(new ReadableStream({ start(controller) {
        controller.enqueue(event({ type: 'provider', provider: 'portfolio' }))
        controller.enqueue(event({ type: 'delta', text: local }))
        controller.enqueue(event({ type: 'done' }))
        controller.close()
      } }), { headers: { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } })
    }
    if (!providers.length) return json({ code: 'not_configured' }, 503)
    // Bound history even for direct API callers. Keep complete exchanges and the
    // latest question; full public facts always remain in the system context.
    messages = messages.slice(-5)
    try { await rateLimit(request) } catch (error) { return json({ code: error.code === 'rate_limit' ? 'rate_limit' : 'unavailable' }, error.code === 'rate_limit' ? 429 : 503) }

    const abort = new AbortController()
    const stream = new ReadableStream({
      async start(controller) {
        let started = false
        try {
          let lastError = new ChatError('rate_limit')
          for (const provider of providers) {
            if (abort.signal.aborted || request.signal.aborted) return
            if (await cooling(provider)) continue
            try {
              const signal = AbortSignal.any([abort.signal, request.signal, AbortSignal.timeout(20000)])
              let length = 0
              for await (const delta of generate(provider, messages, signal)) {
                if (!started) { controller.enqueue(event({ type: 'provider', provider: provider.name })); started = true }
                const text = delta.slice(0, 4000 - length)
                length += text.length
                if (text) controller.enqueue(event({ type: 'delta', text }))
                if (length >= 4000) break
              }
              if (!started) throw new ChatError('unavailable', true)
              controller.enqueue(event({ type: 'done' }))
              return
            } catch (error) {
              if (abort.signal.aborted || request.signal.aborted) return
              const failure = error instanceof ChatError ? error : new ChatError('unavailable', true)
              if (started || !failure.retryable) throw failure
              lastError = failure
              await cool(provider, failure.code === 'rate_limit' ? failure.retryAfter : 20)
            }
          }
          throw lastError
        } catch (error) {
          if (!abort.signal.aborted && !request.signal.aborted) controller.enqueue(event({ type: 'error', code: error instanceof ChatError ? error.code : 'unavailable' }))
        } finally {
          if (!abort.signal.aborted) controller.close()
        }
      },
      cancel() { abort.abort() },
    })
    return new Response(stream, { headers: { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-store, no-transform', 'X-Accel-Buffering': 'no', 'X-Content-Type-Options': 'nosniff' } })
  },
}
