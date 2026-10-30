import assert from 'node:assert/strict'
import { test } from 'node:test'
import { getWorkInquiryReply } from '../src/lib/workInquiry.ts'
import { localPortfolioReply } from '../server/chatScope.js'

test('different client inquiry wordings receive contact details without promising delivery or pricing', () => {
  for (const content of [
    'can you create me website', 'Can you build a website for my business?',
    'Could you design an online store for us?', 'I need a developer for an app.',
    'Can you help me with my project?', 'Please create a dashboard.',
    'I want a workflow automation.', 'Can you fix my website?',
    'How much would a website cost?', 'Can I hire you?', 'How can I work with you?', 'Can we work together?',
    'Need a website.', 'I have an app idea.', "Let's collaborate.",
    'Pwede ka gumawa ng website para sa akin?', 'Gawan mo ako ng app.',
    'Magkano magpagawa ng website?', 'Patulong sa project ko.',
  ]) {
    const reply = getWorkInquiryReply(content)
    assert.match(reply, /jaztinabramcontreras@gmail\.com/, content)
    assert.equal(localPortfolioReply([{ role: 'user', content }]), reply, content)
    assert.doesNotMatch(reply, /\$|₱|delivered|already built|guarantee/i)
  }
})

test('portfolio questions and unrelated generation tasks do not become client inquiries', () => {
  for (const content of ['How did you create GreenWay?', 'How did you work together on GreenWay?', 'What apps have you built?', 'What technologies do you use?', 'Write a Python function.', 'Tell me about yourself.', 'What is your favorite game?', 'Can you create my homework website?', 'Create a website asdfghjkl']) assert.equal(getWorkInquiryReply(content), null, content)
})
