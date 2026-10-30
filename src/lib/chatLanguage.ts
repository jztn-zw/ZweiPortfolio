// Shared, deterministic language handling; these checks never call a model.
const aliases: Record<string, string> = {
  u: 'you', ur: 'your', r: 'are', rn: 'right now', atm: 'at the moment',
  fave: 'favorite', fav: 'favorite', pls: 'please', plz: 'please',
  whats: 'what is', wht: 'what', anu: 'ano', anung: 'anong', sinu: 'sino',
  san: 'saan', pano: 'paano',
  ml: 'mobile legends', cs: 'computer science', bscs: 'bs computer science', js: 'javascript', ts: 'typescript',
  phil: 'philippians', philipians: 'philippians', voleyball: 'volleyball', accoustic: 'acoustic', gutiar: 'guitar',
  wat: 'what', waht: 'what', whta: 'what', hwo: 'how', hobbys: 'hobbies',
}

// Correct only unique, single-edit matches from the public profile vocabulary.
// This includes adjacent transpositions, but never guesses short words or names
// from arbitrary text. Original messages are still sent/displayed unchanged.
const profileWords = new Set(`focusing focused focus focussing working studying learning priorities projects project portfolio greenway skills experience background education student college university course programming developer development technologies technology automation networking frontend backend javascript typescript react mysql express tailwind github linkedin resume contact available internships languages frameworks databases hobbies hobby favorite favourite music instruments guitar acoustic electric basketball volleyball midrange lebron gaming games mobile legends roblox valorant personality curious curiosity learning food adobo giniling philippians verse`.split(' '))
const preserveWords = new Set(['database', 'language', 'framework', 'instrument', 'priority', 'skill', 'collage', 'stocks', 'weather', 'private', 'dating', 'salary', 'password', 'secrets'])
profileWords.add('learn')

function oneEditApart(left: string, right: string): boolean {
  if (Math.abs(left.length - right.length) > 1) return false
  if (left.length === right.length) {
    const differences: number[] = []
    for (let index = 0; index < left.length; index++) if (left[index] !== right[index]) differences.push(index)
    if (differences.length === 1) return true
    if (differences.length !== 2) return false
    const [first, second] = differences
    return second === first + 1 && left[first] === right[second] && left[second] === right[first]
  }
  const shorter = left.length < right.length ? left : right
  const longer = left.length < right.length ? right : left
  let index = 0
  while (index < shorter.length && shorter[index] === longer[index]) index++
  return shorter.slice(index) === longer.slice(index + 1)
}

function correctProfileWord(word: string): string {
  if (word.length < 5 || word.length > 22 || profileWords.has(word) || preserveWords.has(word)) return word
  let match = ''
  for (const candidate of profileWords) {
    if (candidate.length < 5 || !oneEditApart(word, candidate)) continue
    if (match) return word // Ambiguous spelling: let the visitor clarify.
    match = candidate
  }
  return match || word
}

export function normalizeChatQuestion(value: string): string {
  return value.normalize('NFKC').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f\u200b-\u200d\ufeff]/g, '')
    .replace(/[’‘]/g, "'").replace(/\b(what|who|where|how)'s\b/g, '$1 is')
    .replace(/\byou're\b/g, 'you are').replace(/\b[a-z]+\b/g, word => correctProfileWord(Object.hasOwn(aliases, word) ? aliases[word] : word))
    .replace(/\s+/g, ' ').trim()
    .replace(/^what are (focusing|focussing|focused|working|studying|learning)\b/, 'what are you $1')
}

export function hasCurrentFocusTopic(question: string): boolean {
  return /\b(focus(?:es|ed|ing|sed|sing)?|priorit(?:y|ies|izing|ising)|working on|tinututukan|pinagtutuunan|pinagkakaabalahan)\b/.test(normalizeChatQuestion(question))
}

const keyboardNoise = /([a-z]{1,3})\1{3,}|([a-z]{4,6})\2|qwerty|asdfgh|zxcvbn|qazwsx/
const consonantNoise = /[bcdfghjklmnpqrstvwxz]{5,}/

function nearProfileWord(word: string): boolean {
  if (word.length < 5 || word.length > 22) return false
  for (const candidate of profileWords) {
    if (Math.abs(word.length - candidate.length) > 2) continue
    let row = Array.from({ length: candidate.length + 1 }, (_, index) => index)
    for (let left = 0; left < word.length; left++) {
      const next = [left + 1]
      for (let right = 0; right < candidate.length; right++) next.push(Math.min(next[right] + 1, row[right + 1] + 1, row[right] + Number(word[left] !== candidate[right])))
      row = next
    }
    if (row[candidate.length] <= 2) return true
  }
  return false
}

// A single normal answer request can interpret uncertain wording; no separate
// classifier call. This is only a routing hint, never proof of portfolio facts.
export function mayNeedModelUnderstanding(question: string): boolean {
  const text = normalizeChatQuestion(question)
  const words = text.match(/[a-z]+/g) || []
  if (text.length > 220 || words.length < 3) return false
  const first = words[0] || ''
  const questionFrame = ['what', 'who', 'where', 'how', 'why', 'which', 'when', 'tell', 'ano', 'anong', 'sino', 'saan', 'paano', 'bakit'].some(word => first === word || oneEditApart(first, word))
    || /^(do|does|are|is|can|could|may|mahilig)\b/.test(text)
  if (!questionFrame || words.some(word => word.length >= 8 && keyboardNoise.test(word))) return false
  if (words.some(word => word.length >= 8 && consonantNoise.test(word) && word !== 'strengths' && !nearProfileWord(word))) return false
  const selfReference = /\b(your|yourself|jaztin|contreras|mo|mong|ka|ikaw|niya|his)\b/.test(text)
    || /\b(are|do|did|can|could|is) (you|yo|he)\b/.test(text)
  return selfReference || words.some(word => !profileWords.has(word) && nearProfileWord(word))
}

export function isGarbledQuestion(question: string): boolean {
  const text = normalizeChatQuestion(question)
  if (!/\p{L}/u.test(text)) return true
  const garbled = (text.match(/[a-z]+/g) || []).some(word => {
    if (word === 'strengths') return false
    return word.length >= 8 && (consonantNoise.test(word) || keyboardNoise.test(word))
  })
  return garbled && !mayNeedModelUnderstanding(text)
}
