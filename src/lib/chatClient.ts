export type ChatProvider = 'gemini' | 'groq' | 'portfolio'
export type ChatExchange = { id: string; question: string; answer: string; provider: ChatProvider | null; status: 'pending' | 'complete' | 'error' | 'stopped'; code?: string }
export type ChatMessage = { role: 'user' | 'assistant'; content: string }
export type ChatEvent = { type: 'provider'; provider: ChatProvider } | { type: 'delta'; text: string } | { type: 'done' } | { type: 'error'; code: string }
const historyKey = 'jac-ask-ai-conversation-v2'

export class ChatRequestError extends Error {
  code: string
  constructor(code: string) { super(code); this.code = code }
}

export function readChatHistory(): ChatExchange[] {
  try {
    const saved: unknown = JSON.parse(sessionStorage.getItem(historyKey) || '[]')
    if (!Array.isArray(saved)) return []
    return saved.filter((item): item is ChatExchange => Boolean(item && typeof item.id === 'string' && item.id.length <= 80 && typeof item.question === 'string' && item.question.trim() && item.question.length <= 500 && typeof item.answer === 'string' && item.answer.length <= 4000 && ['gemini', 'groq', 'portfolio', null].includes(item.provider) && ['complete', 'stopped', 'error'].includes(item.status))).slice(-8)
  } catch { return [] }
}
export function saveChatHistory(history: ChatExchange[]) {
  try { sessionStorage.setItem(historyKey, JSON.stringify(history.filter(item => item.status !== 'pending').slice(-8))) } catch { /* Chat remains available when browser storage is blocked. */ }
}

export function chatMessages(history: ChatExchange[], question: string): ChatMessage[] {
  const previous: ChatExchange[] = []
  let length = question.length
  for (const exchange of history.filter(item => item.status === 'complete' && item.provider !== 'portfolio' && item.answer).slice(-4).reverse()) {
    length += exchange.question.length + exchange.answer.length
    if (length > 10000) break
    previous.unshift(exchange)
  }
  return [...previous.flatMap(exchange => [{ role: 'user' as const, content: exchange.question }, { role: 'assistant' as const, content: exchange.answer }]), { role: 'user', content: question }]
}

export async function getChatStatus(signal: AbortSignal): Promise<boolean> {
  const response = await fetch('/api/chat', { signal, cache: 'no-store' })
  if (!response.ok) return false
  return (await response.json()).available === true
}

export async function streamChat(messages: ChatMessage[], onEvent: (event: ChatEvent) => void, signal: AbortSignal) {
  const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages }), signal })
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new ChatRequestError(typeof error.code === 'string' ? error.code : 'unavailable')
  }
  if (!response.body || !response.headers.get('content-type')?.includes('text/event-stream')) throw new ChatRequestError('unavailable')
  const reader = response.body.getReader(), decoder = new TextDecoder()
  let buffer = '', finished = false
  const emit = (block: string) => {
    const raw = block.split('\n').filter(line => line.startsWith('data:')).map(line => line.slice(5).trimStart()).join('\n')
    if (!raw) return
    const data = JSON.parse(raw)
    if (data.type === 'error') throw new ChatRequestError(typeof data.code === 'string' ? data.code : 'unavailable')
    if (data.type === 'provider' && ['gemini', 'groq', 'portfolio'].includes(data.provider)) onEvent(data)
    else if (data.type === 'delta' && typeof data.text === 'string') onEvent(data)
    else if (data.type === 'done') { finished = true; onEvent(data) }
  }
  try {
    while (true) {
      const { done, value } = await reader.read()
      buffer = (buffer + decoder.decode(value, { stream: !done })).replaceAll('\r\n', '\n')
      let separator
      while ((separator = buffer.indexOf('\n\n')) !== -1) { emit(buffer.slice(0, separator)); buffer = buffer.slice(separator + 2) }
      if (buffer.length > 100000) throw new ChatRequestError('unavailable')
      if (finished) return
      if (done) { if (buffer.trim()) emit(buffer); break }
    }
    if (!finished) throw new ChatRequestError('interrupted')
  } finally { await reader.cancel().catch(() => {}); reader.releaseLock() }
}

export function chatErrorMessage(code?: string) {
  if (code === 'rate_limit') return 'The free request limit has been reached. Please try again later, or read a portfolio note below.'
  if (code === 'not_configured' || code === 'configuration') return 'AI is not ready yet. You can still explore the portfolio notes below.'
  if (code === 'blocked') return 'I couldn’t answer that request. Try asking about my projects, skills, or background.'
  if (code === 'invalid_request') return 'That message couldn’t be sent. Try a shorter question or start a new chat.'
  if (code === 'interrupted') return 'The connection ended before the answer finished. You can retry your question.'
  return 'AI is temporarily unavailable. Please retry, or read a portfolio note below.'
}
