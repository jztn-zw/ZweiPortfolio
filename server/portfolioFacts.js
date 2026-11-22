import { portfolio, projects } from '../src/data/portfolio.ts'
import { normalizeChatQuestion } from '../src/lib/chatLanguage.ts'

// Only complete, unambiguous questions qualify. Mixed requests and contextual
// follow-ups still pass through the scope filter and normal model path.
export function portfolioFactReply(messages) {
  const text = normalizeChatQuestion(messages.at(-1).content).replace(/[.!?]+$/, '').trim()
  if (/^(?:resume|cv|where (?:is|can i (?:find|download)) your (?:resume|cv))$/.test(text)) {
    return `My résumé is available as a PDF: ${portfolio.resumeUrl}`
  }
  if (/^(?:linkedin|what is your linkedin|where can i find your linkedin)$/.test(text)) {
    const contact = portfolio.contacts.find(item => item.id === 'linkedin' && item.url)
    return contact ? `You can connect with me on LinkedIn: ${contact.url}` : 'I haven’t shared that detail here.'
  }
  if (/^(?:projects|list your projects|what projects have you built|what are your projects)$/.test(text)) {
    return projects.filter(item => item.listed).map(item => `${item.title}: ${item.description} Status: ${item.status}.`).join('\n\n')
  }
  const match = /^(?:(?:tell me about|what is) )?(greenway|vyora|everwell)(?: veterinary clinic)?$/.exec(text)
  if (!match) return null
  const project = projects.find(item => item.listed && item.title.toLowerCase().startsWith(match[1]))
  if (!project) return null
  return `${project.title}: ${project.description}\n\nStatus: ${project.status}. Main technologies: ${project.technologies.slice(0, 4).join(', ')}.`
}
