import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import { test } from 'node:test'
import ts from 'typescript'
import * as personalChat from '../src/lib/personalChat.ts'
import * as chatLanguage from '../src/lib/chatLanguage.ts'
import * as workInquiry from '../src/lib/workInquiry.ts'

function compile(path) {
  return ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2023 },
  }).outputText
}
const portfolio = {}
vm.runInNewContext(compile('../src/data/portfolio.ts'), { exports: portfolio })
const compiled = compile('../src/lib/askAi.ts')
function load(initial = '[]', blocked = false) {
  const exports = {}, stored = new Map([['jac-ask-ai-preview-v1', initial]])
  vm.runInNewContext(compiled, {
    exports,
    require: path => path.includes('personalChat') ? personalChat : path.includes('chatLanguage') ? chatLanguage : path.includes('workInquiry') ? workInquiry : portfolio,
    sessionStorage: {
      getItem: key => { if (blocked) throw new Error('Blocked'); return stored.get(key) },
      setItem: (key, value) => { if (blocked) throw new Error('Blocked'); stored.set(key, value) },
    },
  })
  return { ...exports, stored }
}

test('every suggested topic gives confirmed portfolio details and useful destinations', () => {
  const guide = load()
  assert.equal(guide.askAiTopics.length, 5)
  for (const topic of guide.askAiTopics) {
    const answer = guide.getPortfolioAnswer(topic.question)
    assert.ok(answer.paragraphs.length > 0)
    assert.ok(answer.links.length > 0)
    assert.ok(!answer.paragraphs.join(' ').includes('[PROJECT'))
    for (const link of answer.links) assert.match(link.href, /^(\/|https:\/\/|mailto:)/)
  }
  assert.match(guide.getPortfolioAnswer('Explain GreenWay').paragraphs.join(' '), /completed/)
  assert.ok(guide.getPortfolioAnswer('Contact Jaztin').links.some(link => link.href === 'mailto:jaztinabramcontreras@gmail.com'))
})

test('unknown questions and the unavailable resume are described honestly in preview mode', () => {
  const guide = load()
  assert.match(guide.getPortfolioAnswer('What is the weather today?').paragraphs[0], /focused on my portfolio/)
  assert.match(guide.getPortfolioAnswer('Can I see the resume?').paragraphs[0], /coming soon/)
})

test('all curated answers use Jaztin’s first-person voice', () => {
  const guide = load()
  for (const question of [...guide.askAiTopics.map(topic => topic.question), 'Resume', 'Unknown topic']) {
    const reply = guide.getPortfolioAnswer(question).paragraphs.join(' ')
    assert.match(reply, /\b(I|my|me)\b/i, question)
    assert.doesNotMatch(reply, /\b(he|his|him)\b|Jaztin (is|focuses|enjoys)/i, question)
    assert.ok(!reply.includes('undefined'))
  }
})

test('casual current-focus questions return confirmed focus details instead of a generic redirect', () => {
  const guide = load()
  for (const question of ['what are you focusing rn', 'What are you focused on?', 'What are your priorities?', 'What are you working on rn?', 'Ano ang tinututukan mo ngayon?']) {
    const answer = guide.getPortfolioAnswer(question)
    assert.match(answer.paragraphs.join(' '), /full-stack development, automation, and networking/)
    assert.equal(answer.topic, 'My current focus')
    assert.ok(answer.links.some(link => link.href === '/skills'))
  }
})

test('project inquiries show contact details with a verified email link', () => {
  const guide = load()
  for (const question of ['can you create me website', 'Could you build an app for my company?', 'Gawan mo ako ng website.']) {
    const answer = guide.getPortfolioAnswer(question)
    assert.match(answer.paragraphs.join(' '), /jaztinabramcontreras@gmail\.com/)
    assert.equal(answer.links.length, 1)
    assert.equal(answer.links[0].href, 'mailto:jaztinabramcontreras@gmail.com')
  }
})

test('session history is bounded and rejects malformed or oversized stored values', () => {
  const guide = load(JSON.stringify([null, 5, {}, '', ' ', 'x'.repeat(501), 'Who is Jaztin?']))
  assert.deepEqual(Array.from(guide.readAskAiHistory()), ['Who is Jaztin?'])
  guide.saveAskAiHistory(Array.from({ length: 20 }, (_, index) => `Question ${index}`))
  assert.equal(guide.readAskAiHistory().length, 8)
  assert.equal(guide.readAskAiHistory()[0], 'Question 12')
  guide.saveAskAiHistory([])
  assert.equal(guide.readAskAiHistory().length, 0)
  for (const value of ['{broken', 'null', '{}']) assert.equal(load(value).readAskAiHistory().length, 0)
  const blocked = load('[]', true)
  assert.equal(blocked.readAskAiHistory().length, 0)
  assert.doesNotThrow(() => blocked.saveAskAiHistory(['Hello']))
})
