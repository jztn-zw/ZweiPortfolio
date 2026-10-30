import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'

const root = fileURLToPath(new URL('../', import.meta.url))
const config = JSON.parse(readFileSync(join(root, 'vercel.json'), 'utf8'))
const included = config.functions['api/chat.js'].includeFiles

test('the function package explicitly preserves every raw TypeScript import', () => {
  const seen = new Set()
  function visit(relative) {
    if (seen.has(relative)) return
    seen.add(relative)
    const source = readFileSync(join(root, relative), 'utf8')
    for (const match of source.matchAll(/(?:from\s*|import\s*)['"]([^'"]+)['"]/g)) {
      if (!match[1].startsWith('.')) continue
      const dependency = resolve(root, dirname(relative), match[1]).slice(root.length).replaceAll('\\', '/')
      if (dependency.endsWith('.ts')) assert.ok(included.includes(dependency), `${relative} requires ${dependency} in the deployed function`)
      visit(dependency)
    }
  }
  visit('api/chat.js')
  assert.equal(JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).engines.node, '22.x')
})

test('isolated production-like function boots, handles local replies and streams a mocked provider', () => {
  const directory = mkdtempSync(join(tmpdir(), 'portfolio-chat-package-'))
  try {
    for (const relative of ['package.json', 'api/chat.js', 'server/chat.js', 'server/chatScope.js', 'server/portfolioContext.js', ...included]) {
      mkdirSync(dirname(join(directory, relative)), { recursive: true })
      copyFileSync(join(root, relative), join(directory, relative))
    }
    assert.ok(!existsSync(join(directory, 'node_modules')))
    assert.ok(!existsSync(join(directory, '.env.local')))
    writeFileSync(join(directory, 'verify.mjs'), `
      import assert from 'node:assert/strict'
      import chat from './api/chat.js'
      for (const name of ['GEMINI_API_KEY', 'GROQ_API_KEY', 'VERCEL_ENV', 'VERCEL', 'UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN']) delete process.env[name]
      assert.equal((await chat.fetch(new Request('https://portfolio.test/api/chat'))).status, 200)
      const request = content => new Request('https://portfolio.test/api/chat', { method: 'POST', headers: { Origin: 'https://portfolio.test', 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: [{ role: 'user', content }] }) })
      let calls = 0
      globalThis.fetch = async () => { calls++; return new Response('data: {"candidates":[{"content":{"parts":[{"text":"I build web applications."}]},"finishReason":"STOP"}]}\\n\\n') }
      for (const content of ['Hi', 'sdfasjbhnvjks', 'Can you create me a website?']) {
        const response = await chat.fetch(request(content))
        assert.equal(response.status, 200)
        assert.match(await response.text(), /"provider":"portfolio"/)
      }
      assert.equal(calls, 0)
      process.env.GEMINI_API_KEY = 'test-only-key'
      const response = await chat.fetch(request('What are you focusing on rn?'))
      const body = await response.text()
      assert.match(body, /I build web applications/)
      assert.match(body, /"type":"done"/)
      assert.equal(calls, 1)
    `)
    const result = spawnSync(process.execPath, ['verify.mjs'], { cwd: directory, encoding: 'utf8', timeout: 15000 })
    assert.equal(result.status, 0, result.stderr || result.error?.message)
  } finally {
    // Only delete the exact temporary directory created by this test.
    assert.ok(directory.startsWith(join(tmpdir(), 'portfolio-chat-package-')))
    rmSync(directory, { recursive: true, force: true })
  }
})
