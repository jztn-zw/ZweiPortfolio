import { aboutMe, capabilities, portfolio, projects } from '../data/portfolio'
import { getPersonalAnswer, getPrivateReply } from './personalChat'
import { hasCurrentFocusTopic, normalizeChatQuestion } from './chatLanguage'
import { getWorkInquiryReply, workInquiryEmail } from './workInquiry'

export const askAiHistoryKey = 'jac-ask-ai-preview-v1'
export const askAiQuestionLimit = 500
export const askAiHistoryLimit = 8

export const askAiTopics = [
  { id: 'about', label: 'About me', detail: 'BACKGROUND / CURIOSITY', question: 'Tell me about yourself.' },
  { id: 'projects', label: 'My work', detail: 'PROJECTS / GREENWAY', question: 'Tell me about GreenWay.' },
  { id: 'skills', label: 'My toolkit', detail: 'DEVELOPMENT / AUTOMATION', question: 'What technologies do you use?' },
  { id: 'contact', label: 'Work with me', detail: 'OPPORTUNITIES / CONTACT', question: 'How can I work with you?' },
  { id: 'personal', label: 'Off the keyboard', detail: 'HOBBIES / A LITTLE ABOUT ME', question: 'What do you enjoy outside coding?' },
] as const

export type PortfolioAnswer = {
  topic: string
  paragraphs: string[]
  links: { label: string; href: string }[]
}

// Curated, local fallback answers. Kept separate from generated responses.
export function getPortfolioAnswer(question: string): PortfolioAnswer {
  const privateReply = getPrivateReply(question)
  if (privateReply) return { topic: 'A little privacy', paragraphs: [privateReply], links: [] }
  const inquiry = getWorkInquiryReply(question)
  if (inquiry) return { topic: 'Let’s discuss your project', paragraphs: [inquiry], links: [{ label: 'Email me', href: workInquiryEmail }] }
  if (hasCurrentFocusTopic(question)) return {
    topic: 'My current focus',
    paragraphs: [`I’m focused on ${aboutMe.focus}. I’m building my skills through hands-on projects and exploring new technologies.`],
    links: [{ label: 'Explore my skills', href: '/experience/skills' }, { label: 'More about me', href: '/experience#about' }],
  }
  const personalAnswer = getPersonalAnswer(question)
  if (personalAnswer) return { topic: 'Off the keyboard', paragraphs: [personalAnswer], links: [{ label: 'More about me', href: '/experience#about' }] }
  const text = normalizeChatQuestion(question)
  const namedProject = projects.find(project => project.listed && text.includes(project.title.toLowerCase().split(' ')[0]))
  if (namedProject && namedProject.artwork !== 'greenway') return {
    topic: namedProject.title,
    paragraphs: [namedProject.description, `Status: ${namedProject.status}. Main technologies: ${namedProject.technologies.slice(0, 4).join(', ')}.`],
    links: [
      ...(namedProject.detailsUrl ? [{ label: 'View project', href: namedProject.detailsUrl }] : []),
      ...(namedProject.liveUrl ? [{ label: 'Visit website', href: namedProject.liveUrl }] : []),
    ],
  }
  if (/resume|résumé|cv\b/.test(text)) return {
    topic: 'Resume',
    paragraphs: ['My résumé is available as a PDF with my skills, projects, and education.'],
    links: [{ label: 'View résumé PDF', href: portfolio.resumeUrl }, { label: 'Get in touch', href: '/experience#contact' }],
  }
  if (/contact|email|reach|hire|opportunit|availab|collaborat|work with|connect/.test(text)) return {
    topic: 'Let’s connect',
    paragraphs: [`I’m ${portfolio.availability.toLowerCase()}. I’m interested in development opportunities, collaboration, and practical projects.`, 'Have something in mind? Send me an email with a little about your idea or opportunity.'],
    links: portfolio.contacts.filter(contact => contact.url).map(contact => ({ label: contact.id === 'email' ? 'Send an email' : contact.id === 'linkedin' ? 'Connect on LinkedIn' : 'Visit GitHub', href: contact.url! })),
  }
  if (/greenway|capstone|waste|project|built/.test(text)) {
    const greenway = projects.find(project => project.artwork === 'greenway')!
    return {
      topic: 'GreenWay',
      paragraphs: [`One of my projects is GreenWay, ${greenway.description[0].toLowerCase()}${greenway.description.slice(1)}`, `It’s a completed web and mobile project. I used ${greenway.technologies.slice(0, 4).join(', ')}. You can explore the case study for more about the application.`],
      links: [{ label: 'Inside GreenWay', href: greenway.detailsUrl! }, { label: 'Visit live site', href: greenway.liveUrl! }],
    }
  }
  if (/skill|tech|tool|stack|frontend|backend|mobile|automat|network|react|codex|antigravity|n8n|develop|build|code/.test(text)) return {
    topic: 'The toolkit',
    paragraphs: ['I focus on full-stack development, automation, and networking.', capabilities.map(capability => `For ${capability.title.toLowerCase()}, I use ${capability.technologies.join(', ')}.`).join(' ')],
    links: [{ label: 'View stack & skills', href: '/experience/skills' }],
  }
  if (/who|about|background|student|education|study|studying|college|university|yourself|jaztin|hello|\bhi\b/.test(text)) return {
    topic: 'Meet Jaztin',
    paragraphs: [`I’m ${portfolio.name}, a 4th-year BS Computer Science student based in ${portfolio.location}.`, 'I started with gaming graphics and banner design, then grew into building web and mobile applications. I enjoy understanding how systems work and turning ideas into practical solutions.'],
    links: [{ label: 'More about me', href: '/experience#about' }, { label: 'Explore my journey', href: '/experience#journey' }],
  }
  return {
    topic: 'A quick note',
    paragraphs: ['I’m keeping this chat focused on my portfolio. I can tell you about my background, GreenWay, the tools I use, or how we can work together.', 'Pick one of the topics below to explore.'],
    links: [],
  }
}

export function readAskAiHistory(): string[] {
  try {
    const saved: unknown = JSON.parse(sessionStorage.getItem(askAiHistoryKey) ?? '[]')
    if (!Array.isArray(saved)) return []
    return saved.filter((question): question is string => typeof question === 'string' && question.trim().length > 0 && question.length <= askAiQuestionLimit).slice(-askAiHistoryLimit)
  } catch { return [] }
}

export function saveAskAiHistory(questions: string[]) {
  try { sessionStorage.setItem(askAiHistoryKey, JSON.stringify(questions.slice(-askAiHistoryLimit))) } catch { /* The preview still works when storage is unavailable. */ }
}
