// Shared, deterministic language handling; these checks never call a model.
const aliases: Record<string, string> = {
  u: 'you', ur: 'your', r: 'are', rn: 'right now', atm: 'at the moment',
  fave: 'favorite', fav: 'favorite', pls: 'please', plz: 'please',
  whats: 'what is', wht: 'what', anu: 'ano', anung: 'anong', sinu: 'sino',
  san: 'saan', pano: 'paano',
  ml: 'mobile legends', cs: 'computer science', bscs: 'bs computer science', js: 'javascript', ts: 'typescript',
  phil: 'philippians', philipians: 'philippians', voleyball: 'volleyball', accoustic: 'acoustic', gutiar: 'guitar',
}

export function normalizeChatQuestion(value: string): string {
  return value.normalize('NFKC').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f\u200b-\u200d\ufeff]/g, '')
    .replace(/[’‘]/g, "'").replace(/\b(what|who|where|how)'s\b/g, '$1 is')
    .replace(/\byou're\b/g, 'you are').replace(/\b[a-z]+\b/g, word => aliases[word] || word)
    .replace(/\s+/g, ' ').trim()
}

export function hasCurrentFocusTopic(question: string): boolean {
  return /\b(focus(?:es|ed|ing|sed|sing)?|priorit(?:y|ies|izing|ising)|working on|tinututukan|pinagtutuunan|pinagkakaabalahan)\b/.test(normalizeChatQuestion(question))
}

export function isGarbledQuestion(question: string): boolean {
  const text = normalizeChatQuestion(question)
  if (!/\p{L}/u.test(text)) return true
  return (text.match(/[a-z]+/g) || []).some(word => {
    if (word === 'strengths') return false
    return word.length >= 8 && (/[bcdfghjklmnpqrstvwxz]{5,}/.test(word) || /([a-z]{1,3})\1{3,}|([a-z]{4,6})\2/.test(word) || /qwerty|asdfgh|zxcvbn|qazwsx/.test(word))
  })
}
