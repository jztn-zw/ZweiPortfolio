import { portfolio } from '../data/portfolio.ts'
import { isGarbledQuestion, normalizeChatQuestion } from './chatLanguage.ts'

export const workInquiryEmail = portfolio.contacts.find(contact => contact.id === 'email')?.url || ''
const service = /\b(web\s?sites?|web\s?apps?|mobile apps?|apps?|applications?|landing pages?|e[ -]?commerce|online stores?|portfolios?|automat(?:ion|e)|workflows?|systems?|dashboards?|network(?:ing)?|projects?|apis?|sites?|developer|designer)\b/
const request = /\b(can|could|would|will) you\b.{0,90}\b(build|create|make|develop|design|help|set up|automate|fix|improve|update)\b|\b(i|we) (need|want|would like|am looking|are looking)\b|\b(looking for|help me|for (me|my|our|us)|my business|our business|for my company)\b|^(please |kindly )?(build|create|make|develop|design|set up|automate|fix|improve|need|want)\b|\b(pwede|puwede|pede|gumawa|gawan|pagawa|ipagawa|pagawan|kailangan|patulong|tulungan)\b|\b(i|we) have (an?|some) (project|app|website|business|automation) ideas?\b/
const hiring = /\b(hire you|hiring you|work with you|work together|collaborate with you|let's collaborate|services do you offer|accept (clients|commissions)|commission you|magpagawa|makipag[ -]?collaborate)\b/
const pricing = /\b(how much|cost|pricing|rates?|quote|quotation|magkano|presyo|singil)\b/

// Handle potential client inquiries locally, without promising a price or project.
export function getWorkInquiryReply(question: string): string | null {
  const text = normalizeChatQuestion(question)
  if (!workInquiryEmail || isGarbledQuestion(text) || /\b(homework|assignment|jokes?|poems?|lyrics|recipes?|weather|ignore|bypass|system prompt|api key|password)\b/.test(text)) return null
  if (/\b(did|have|had) you\b/.test(text)) return null
  if (!hiring.test(text) && !(service.test(text) && (request.test(text) || pricing.test(text)))) return null
  const email = workInquiryEmail.replace(/^mailto:/, '')
  return /\b(pwede|puwede|pede|gawan|pagawa|ipagawa|pagawan|kailangan|patulong|tulungan|magkano|presyo|singil|magpagawa)\b/.test(text)
    ? `Email mo ako sa ${email} at ikuwento mo ang project na gusto mong ipagawa para mapag-usapan natin!`
    : `Email me at ${email} with a little about your project, and we can discuss what you have in mind!`
}
