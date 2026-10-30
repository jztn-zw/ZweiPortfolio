import { getPrivateReply, isPersonalQuestion } from '../src/lib/personalChat.ts'
import { hasCurrentFocusTopic, isGarbledQuestion, normalizeChatQuestion } from '../src/lib/chatLanguage.ts'
import { capabilities, projects } from '../src/data/portfolio.ts'
import { getWorkInquiryReply } from '../src/lib/workInquiry.ts'

// Conservative local scope check: no AI classification request or provider quota.
const redirect = "I’m keeping this chat focused on my portfolio and the things I’ve shared about myself. Ask me about my projects, skills, background, or hobbies."
const clarify = 'I didn’t quite catch that. Could you rephrase your question about me, my work, or my hobbies?'
const bareTopics = new Set(capabilities.flatMap(item => [...item.technologies, item.title]).concat(projects.filter(item => item.status === 'Completed').flatMap(item => [item.title, ...item.technologies])).map(normalizeChatQuestion))
const publicTopics = /\b(cod(?:e|es|ed|ing)|develop(?:er|ment|ing)?|programm(?:er|ing)|languages?|frameworks?|databases?|apis?|design(?:ing|ed)?|creat(?:ed|ing)|built|build(?:ing)?|speciali[sz](?:e|ing|ation)|strengths?|goals?|career|motivat(?:es?|ion)|inspir(?:es?|ed|ation)|enrolled|graduat(?:e|ing|ion)|internships?|cv|reach|based|live|work|projects?|proyekto|ginawa|inaaral|nag[ -]?aaral|kolehiyo|unibersidad|nakakatulong)\b/
const personal = /\b(you|your|yourself|jaztin|contreras|he|his|him|ikaw|kayo|mo|mong|ka|iyong|niyo|siya|sya|niya|nya)\b/
const project = /\b(greenway|candelaria|waste management|collection tracking|pickup schedules?|resident reports?)\b/
const subject = /\b(projects?|capstone|portfolio|skills?|experience|technolog\w*|tools?|tech stack|programming languages?|frontend|backend|full[ -]?stack|mobile|automation|networking|react|typescript|javascript|node\.?js|express|mysql|expo|tailwind|codex|antigravity|n8n|socket\.?io|leaflet|maplibre|cloudinary|education|stud\w*|school|college|university|computer science|degree|background|journey|graphics?|banners?|design|location|sariaya|quezon|philippines|contact|email|github|linkedin|resume|availability|available|opportunit\w*|hire|collaborat\w*|work together|work with|interests?|focus|name|built|build|building|learning|inspiration|enverga|mseuf|proyekto|kasanayan|pinag[ -]?aaralan|trabaho|paaralan|kurso|taga[ -]?saan)\b/
const personalQuestion = /\b(who are you|who is jaztin|about (you|yourself)|where (are you|do you live)|what do you do|where are you from|sino ka|sino si jaztin|saan ka|ano ang ginagawa mo|tell me about yourself|can we (collaborate|work together))\b/
const unrelated = /\b(weather|forecast|horoscope|recipes?|cooking|jokes?|poems?|lyrics|celebrit\w*|football|cricket|lottery|bitcoin|crypto|stock price|stock market|president|election|capital of|medical advice|diagnos\w*|homework|assignment|trivia|standings|box score|sports news|game guides?|cheats?|ranked builds?|nba scores?)\b/
const task = /\b(ignore|override|bypass)\b.{0,60}\b(instructions?|rules?|system|prompt)\b|\b(system prompt|reveal your prompt|api keys?|passwords?|secrets?)\b|(?:^|[.!?;,:]\s*|\b(?:and|also|then|but|at|tapos)\s+)(?:(?:please|just|kindly)\s+|(?:(?:can|could|would|will) you|i (?:want|need) you to|help me(?: to)?)\s+)*(?:write|generate|debug|calculate|solve|translate|summari[sz]e|build|create|make|code|gumawa|isulat|sagutan|i-?solve|i-?translate)\b|\b(?:how to|help me(?: to)?)\s+(?:write|generate|debug|calculate|solve|translate|summari[sz]e|build|create|make|code)\b/
const topicFollowup = /^(and\b|also\b|what about\b|how about\b)/
const profileSummary = /^(?:(?:can|could) you |please )?(?:summari[sz]e|write|give(?: me)?) (?:a (?:short |brief )?(?:bio|introduction|summary) (?:of |about )?(?:you|yourself|your (?:work|skills|background|experience|portfolio))|your (?:work|skills|background|experience|portfolio))[?.!]*$/
const followup = /^(tell me more|more( details)?|explain (that|it|further)|can you elaborate( on (that|it))?|what else|why( is that| that| so)?|how (does|did) (it|that) work|what features does it have|is it (completed|finished|live|available|open source)|can i (try|test|see) it|bakit( naman| ganun| iyon| yun)?|paano( yun| iyon| yan)?|ano pa|tapos)[?.!\s]*$/

function relevant(text, hasContext) {
  if (profileSummary.test(text)) return true
  if (/\b(course|ginagawa)\b/.test(text) && personal.test(text)) return true
  if (hasCurrentFocusTopic(text) && (personal.test(text) || topicFollowup.test(text))) return true
  if (publicTopics.test(text) && (personal.test(text) || hasContext && topicFollowup.test(text))) return true
  if (/\b(what (year are you in|makes you happy|are you like|do you do for fun)|why (computer science|bs ?cs)|bakit (computer science|bs ?cs)|how do you learn)\b/.test(text)) return true
  if (isPersonalQuestion(text, hasContext)) return true
  if (project.test(text) || personalQuestion.test(text)) return true
  if (subject.test(text) && (personal.test(text) || topicFollowup.test(text))) return true
  // Bare portfolio topics are useful shortcuts, unlike general technology Q&A.
  if (/^(projects?|skills?|tech stack|frontend|backend|automation|networking|education|background|contact|email|resume|github|linkedin)[?.!\s]*$/.test(text)) return true
  if (bareTopics.has(text.replace(/[?.!]+$/, '').trim())) return true
  if (hasContext && /^(what (tech(nologies)?|tools?|stack|frameworks?) (does it|did you) use|what is (its|the) (tech )?stack|where can i (try|see|test) it|can i see (it|a demo)|is (it|that) (live|done|completed|finished)|does it work on mobile|where can i find (it|the code))[?.!\s]*$/.test(text)) return true
  return hasContext && followup.test(text)
}

// null means a relevant question can proceed to Gemini/Groq; strings stay local.
export function localPortfolioReply(messages) {
  const text = normalizeChatQuestion(messages.at(-1).content)
  const privateReply = getPrivateReply(text)
  if (privateReply) return privateReply
  if (isGarbledQuestion(text)) return clarify
  if (/^(how are you( doing)?|how is it going|what is up|kumusta ka|kamusta ka)[?.!\s]*$/.test(text)) return 'Hey! Happy to share a little about my work and hobbies. What would you like to know?'
  if (/^(hi|hello|hey|hiya|good (morning|afternoon|evening)|kumusta|kamusta|musta|hello po|hi po)(\s+jaztin)?[.!?\s]*$/.test(text)) return "Hey, I’m Jaztin! Feel free to ask me about my projects, skills, or background."
  if (/^(thanks|thank you|thank you so much|salamat|salamat po|okay|ok|nice|cool|got it)[.!?\s]*$/.test(text)) return "You’re welcome! Let me know if you’d like to know more about my work."
  if (/^(bye|goodbye|see you|paalam)[.!?\s]*$/.test(text)) return "Thanks for stopping by! Feel free to reach out if you have something in mind."
  if (/\b(are you (an? )?(ai|bot|human|real person)|is this (automated|ai|a bot)|automated chat|ikaw ba.*(ai|bot))\b/.test(text)) return "This is my portfolio’s automated chat, sharing information in my voice. For a direct conversation, you can reach me by email."
  if (unrelated.test(text) || /\d\s*[+*/=]\s*\d/.test(text)) return redirect
  const inquiry = getWorkInquiryReply(text)
  if (inquiry) return inquiry
  if (task.test(text) && !profileSummary.test(text)) return redirect
  let context = false
  for (const message of messages.slice(0, -1)) {
    if (message.role !== 'user') continue
    const previous = normalizeChatQuestion(message.content)
    context = !isGarbledQuestion(previous) && (!task.test(previous) || profileSummary.test(previous)) && !unrelated.test(previous) && !getPrivateReply(previous) && relevant(previous, context)
  }
  return relevant(text, context) ? null : redirect
}
