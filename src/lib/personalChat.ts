import { personalProfile } from '../data/portfolio.ts'
import { normalizeChatQuestion } from './chatLanguage.ts'

const normalize = normalizeChatQuestion
const privateTopics = /\b(relationships?|relationship status|dating|girlfriends?|boyfriends?|gf|bf|ex girlfriend|ex boyfriend|crush|love life|romantic|married|marriage|seeing anyone|sexual|sex life|jowa|syota|nobya|nobyo|kasintahan|asawa|lovelife|karelasyon|nililigawan|breakup|ex mo|ex nya|age|birthday|birth date|date of birth|salary|income|net worth|phone number|home address|family|parents|siblings|political|religion|edad|kaarawan|sahod)\b/
const relationshipStatus = /^(single|taken)[?.!\s]*$|\b(are you|is (jaztin|he)) (still )?(single|taken)\b|\b(single|taken) (ka|ba|si jaztin)\b/
const topics = /\b(hobb(?:y|ies)|pastimes?|free time|outside (coding|work)|food|adobo|giniling|music|songs?|genre|instruments?|guitar|bass|acoustic|electric|basketball|volleyball|voleyball|midrange|lebron|goat|idol|nba|gaming|games?|mobile legends|roblox|valorant|personality|shy|makulit|curious|curiosity|learn|learning|hands[ -]on|favorite verse|favourite verse|bible verse|philippians|filipos|pagkain|hilig|libangan|ugali|mahiyain|palatanong|matuto|natututo|natutoto)\b/
const owner = /\b(you|your|yourself|jaztin|contreras|he|his|him|ikaw|mo|mong|ka|siya|niya|nya|iyong|paborito)\b/

export function getPrivateReply(question: string): string | null {
  const text = normalize(question)
  // Technical database relationships are unrelated to private life.
  if (!privateTopics.test(text.replace(/\b(database|table|entity|foreign[ -]key) relationships?\b/g, '')) && !relationshipStatus.test(text.trim())) return null
  return /\b(mo|ka|ba|siya|niya|nya|jowa|syota|nobya|nobyo|asawa|karelasyon|edad|sahod)\b/.test(text)
    ? 'Sa akin na muna ang part na ’yan ng buhay ko. 😄 Pero game akong magkuwento tungkol sa projects, hobbies, at mga hilig ko!'
    : 'I keep that part of my life private. 😄 I’m happy to talk about my projects, hobbies, and interests, though!'
}

export function isPersonalQuestion(question: string, hasContext = false): boolean {
  const text = normalize(question).trim()
  if (/\b(sports?|introvert(?:ed)?|extrovert(?:ed)?|outgoing)\b/.test(text) && owner.test(text)) return true
  if (/\b(what (makes you happy|are you like|do you do for fun)|how do you relax)\b/.test(text)) return true
  return topics.test(text) && (owner.test(text)
    || /^(favou?rite (food|games?|music|verse|instruments?|basketball player)|hobbies|music( taste)?|personality|learning style|philippians 4:13|lebron|basketball|instruments)[?.!\s]*$/.test(text)
    || hasContext && /^(and|also|what about|how about|why|bakit|paano)\b/.test(text))
}

// Saved replies for offline/error fallback; generated chat uses these same facts.
export function getPersonalAnswer(question: string): string | null {
  if (!isPersonalQuestion(question)) return null
  const text = normalize(question)
  if (/verse|philippians|filipos/.test(text)) return `My favorite verse is ${personalProfile.favoriteVerse.reference}: “${personalProfile.favoriteVerse.text}” (${personalProfile.favoriteVerse.translation}).`
  if (/food|adobo|giniling|pagkain/.test(text)) return `My favorites are ${personalProfile.favoriteFood.join(' and ')}. Those are my picks!`
  if (/music|songs?|genre/.test(text)) return personalProfile.musicTaste
  if (/instrument|guitar|bass|acoustic|electric/.test(text)) return `I enjoy playing ${personalProfile.instruments.join(', ')}. Music is one of my hobbies outside coding.`
  if (/lebron|goat|idol/.test(text)) return `My basketball idol is ${personalProfile.basketball.idol}—${personalProfile.basketball.nickname}! He’s my personal GOAT. 😄`
  if (/basketball|midrange|volleyball|voleyball|nba/.test(text)) return `I enjoy basketball and volleyball. In basketball, I’d describe my playing style as a ${personalProfile.basketball.playingStyle.toLowerCase()}, rather than naming a fixed position. My idol is ${personalProfile.basketball.idol}.`
  if (/gaming|games?|mobile legends|roblox|valorant/.test(text)) return `My favorite game is ${personalProfile.games.favorite}, and I play ${personalProfile.games.sometimes} sometimes. I also play ${personalProfile.games.alsoPlays.join(', ')}—I enjoy games that make me happy.`
  if (/personality|shy|makulit|curious|curiosity|ugali|mahiyain|palatanong|introvert|extrovert|outgoing/.test(text)) return `${personalProfile.personality} Tahimik lang sa umpisa—kapag comfortable na, lalabas din ang kakulitan ko. 😄`
  if (/learning style|learn best|how.*learn|hands[ -]on|matuto|natututo|natutoto/.test(text)) return personalProfile.learningStyle
  if (/learn/.test(text)) return null
  return `Outside coding, I enjoy basketball, volleyball, gaming, and playing electric guitar, bass, and acoustic guitar. My favorite game is ${personalProfile.games.favorite}.`
}
