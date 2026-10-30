import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import { test } from 'node:test'
import ts from 'typescript'

const compiled = ts.transpileModule(readFileSync(new URL('../src/lib/chatClient.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2023 } }).outputText
function load(fetcher = () => { throw new Error('Unexpected network call') }) {
  const exports = {}, stored = new Map()
  vm.runInNewContext(compiled, { exports, fetch: fetcher, TextDecoder, sessionStorage: { getItem: key => stored.get(key), setItem: (key, value) => stored.set(key, value) } })
  return { ...exports, stored }
}
const entry = (id, status = 'complete', provider = 'gemini') => ({ id, question: 'Who is Jaztin?', answer: 'A developer.', status, provider })

test('only complete AI turns enter provider history; large histories remain within backend limits', () => {
  const client = load()
  const output = client.chatMessages([entry('1'), entry('2', 'error'), entry('3', 'complete', 'portfolio'), entry('4', 'stopped')], 'What does he build?')
  assert.deepEqual(JSON.parse(JSON.stringify(output)), [{ role: 'user', content: 'Who is Jaztin?' }, { role: 'assistant', content: 'A developer.' }, { role: 'user', content: 'What does he build?' }])
  const large = client.chatMessages(Array.from({ length: 8 }, (_, i) => ({ ...entry(`${i}`), answer: 'x'.repeat(4000) })), 'Next question')
  assert.ok(large.length <= 9)
  assert.ok(large.reduce((sum, message) => sum + message.content.length, 0) <= 10000)
})

test('finished session history restores actual answers while invalid or pending entries are excluded', () => {
  const client = load()
  client.saveChatHistory([entry('1'), entry('2', 'pending')])
  assert.equal(client.readChatHistory().length, 1)
  assert.equal(client.readChatHistory()[0].answer, 'A developer.')
  client.saveChatHistory([entry('3', 'complete', 'unknown')])
  assert.equal(client.readChatHistory().length, 0)
  client.saveChatHistory([])
  assert.equal(client.readChatHistory().length, 0)
})

test('streaming delivers real chunks and detects an incomplete connection', async () => {
  for (const completed of [true, false]) {
    const raw = `data: {"type":"provider","provider":"groq"}\r\n\r\ndata: {"type":"delta","text":"Kumusta—你好"}\r\n\r\n${completed ? 'data: {"type":"done"}\n\n' : ''}`
    const bytes = new TextEncoder().encode(raw)
    const client = load(async () => new Response(new ReadableStream({ start(controller) { for (const byte of bytes) controller.enqueue(new Uint8Array([byte])); controller.close() } }), { headers: { 'Content-Type': 'text/event-stream' } }))
    const output = []
    const request = client.streamChat([{ role: 'user', content: 'Hello' }], event => output.push(event), new AbortController().signal)
    if (completed) await request
    else await assert.rejects(request, error => error.code === 'interrupted')
    assert.equal(output[0].provider, 'groq')
    assert.equal(output[1].text, 'Kumusta—你好')
  }
})

test('rate-limit and provider errors remain structured for retry or a labelled portfolio fallback', async () => {
  for (const response of [Response.json({ code: 'rate_limit' }, { status: 429 }), new Response('data: {"type":"error","code":"configuration"}\n\n', { headers: { 'Content-Type': 'text/event-stream' } })]) {
    const client = load(async () => response)
    await assert.rejects(client.streamChat([], () => {}, new AbortController().signal), error => ['rate_limit', 'configuration'].includes(error.code))
  }
})

test('server-local portfolio replies retain their source and stay out of subsequent model history', async () => {
  const client = load(async () => new Response('data: {"type":"provider","provider":"portfolio"}\n\ndata: {"type":"delta","text":"I keep this chat focused on my work."}\n\ndata: {"type":"done"}\n\n', { headers: { 'Content-Type': 'text/event-stream' } }))
  const output = []
  await client.streamChat([{ role: 'user', content: 'Weather?' }], event => output.push(event), new AbortController().signal)
  assert.equal(output[0].provider, 'portfolio')
  assert.equal(output.at(-1).type, 'done')
  const messages = client.chatMessages([{ ...entry('local', 'complete', output[0].provider), question: 'Weather?', answer: output[1].text }], 'What is your tech stack?')
  assert.equal(messages.length, 1)
  assert.equal(messages[0].content, 'What is your tech stack?')
})
