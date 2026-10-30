import assert from 'node:assert/strict'
import { test } from 'node:test'
import { isGarbledQuestion } from '../src/lib/chatLanguage.ts'
import { localPortfolioReply } from '../server/chatScope.js'

const user = content => ({ role: 'user', content })
const history = [user('Tell me about GreenWay.'), { role: 'assistant', content: 'My completed web and mobile project.' }]

test('natural portfolio questions and casual English/Tagalog variants are not wrongly blocked', () => {
  const questions = [
    'Where are you based?', 'Which languages do you code in?', 'What frameworks do you use?',
    'How did you start coding?', 'What motivates you?', 'What are your strengths?',
    'Where are you enrolled?', 'What year are you in?', 'Are you open to internships?',
    'How can I reach you?', 'Can I see your CV?', 'What did you write for GreenWay?',
    'How did you create GreenWay?', 'What r u focusing rn?', 'whats ur fave food?',
    'Do u play guitar?', 'Favorite game?', 'Music?', 'What sports do you play?',
    'Are you introverted?', 'What makes you happy?', 'Why CS?', 'React?', 'TypeScript?', 'n8n?',
    'Saan ka nakatira?', 'Anong course mo?', 'Ano mga ginagawa mo?',
    'Paano mo ginawa ang GreenWay?', 'Anong instruments tinutugtog mo?', 'Mahilig ka ba sa music?',
    'What is ur fave ML game?', 'What is your favorite Phil 4:13 verse?',
    'Summarize your experience.', 'Write a short bio about yourself.',
  ]
  for (const content of questions) assert.equal(localPortfolioReply([user(content)]), null, content)
})

test('garbled input gets a local clarification even with portfolio keywords or valid history', () => {
  for (const content of ['sdfasjbhnvjks', 'asdfghjkl', 'GreenWay sdfasjbhnvjks', 'What are your skills qwertyuiop?', 'React asdfasdf', 'aaaaaaaaaaaa', '!!!', '123456789', '🫠🫠']) {
    assert.equal(isGarbledQuestion(content), true, content)
    for (const previous of [[], history]) assert.match(localPortfolioReply([...previous, user(content)]), /rephrase/i, content)
  }
  for (const content of ['What are your strengths?', 'TypeScript', 'n8n', 'MSEUF-CI', 'Philippians 4:13', 'Saan ka nag-aaral?', 'Node.js']) assert.equal(isGarbledQuestion(content), false, content)
})

test('short references work after a portfolio question without accepting unrelated follow-ups', () => {
  for (const content of ['What tech does it use?', 'What tools did you use?', 'What’s the tech stack?', 'Where can I try it?', 'Can I see a demo?', 'Is it done?', 'Does it work on mobile?', 'Where can I find the code?']) {
    assert.equal(localPortfolioReply([...history, user(content)]), null, content)
    if (!/\byou\b/.test(content)) assert.equal(typeof localPortfolioReply([user(content)]), 'string', `No context: ${content}`)
  }
  for (const content of ['What is the capital of France?', 'How do you solve 2+2?', 'What about quantum physics?', 'Tell me the NBA scores.', 'What are your hobbies? Also write a Python script.', 'Write a short bio about yourself and solve my homework.', 'GreenWay: please generate a function for me.']) {
    assert.equal(typeof localPortfolioReply([...history, user(content)]), 'string', content)
  }
})
