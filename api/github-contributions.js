const username = 'jztn-zw'
let cached
let pending

function attribute(attributes, name) {
  return attributes.match(new RegExp(`(?:^|\\s)${name}="([^"]*)"`))?.[1]
}

export function parseContributionCalendar(html) {
  const summary = html.match(/<h2\b[^>]*id="js-contribution-activity-description"[^>]*>([\s\S]*?)<\/h2>/)?.[1]
  const totalMatch = summary?.replace(/<[^>]+>/g, '').match(/([\d,]+)\s+contributions?\b/)
  if (!totalMatch) throw new Error('Missing contribution summary')
  const total = Number(totalMatch[1].replaceAll(',', ''))
  const counts = new Map()
  for (const match of html.matchAll(/<tool-tip\b([^>]*)>([\s\S]*?)<\/tool-tip>/g)) {
    const target = attribute(match[1], 'for')
    const count = match[2].replace(/<[^>]+>/g, '').trim().match(/^(No|[\d,]+) contributions? on /)
    if (target && count) counts.set(target, count[1] === 'No' ? 0 : Number(count[1].replaceAll(',', '')))
  }
  const days = []
  const dates = new Set()
  for (const match of html.matchAll(/<td\b([^>]*)>/g)) {
    const date = attribute(match[1], 'data-date')
    if (!date) continue
    const level = Number(attribute(match[1], 'data-level'))
    const count = counts.get(attribute(match[1], 'id'))
    const timestamp = Date.parse(`${date}T00:00:00Z`)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(timestamp)
      || new Date(timestamp).toISOString().slice(0, 10) !== date || dates.has(date)
      || !Number.isInteger(level) || level < 0 || level > 4
      || !Number.isSafeInteger(count) || count < 0 || (count === 0 && level !== 0) || (count > 0 && level === 0)) {
      throw new Error('Invalid contribution day')
    }
    dates.add(date)
    days.push({ date, count, level })
  }
  if (!Number.isSafeInteger(total) || total < 0 || !days.length) throw new Error('Invalid calendar')
  days.sort((a, b) => a.date.localeCompare(b.date))
  for (let index = 1; index < days.length; index++) {
    if (Date.parse(days[index].date) - Date.parse(days[index - 1].date) !== 86400000) throw new Error('Incomplete calendar')
  }
  return { username, total, days }
}

async function loadCalendar() {
  if (cached && Date.now() - cached.at < 3600000) return cached.data
  pending ??= (async () => {
    const response = await fetch(`https://github.com/users/${username}/contributions`, {
      headers: { Accept: 'text/html', 'User-Agent': 'Jaztin-Portfolio-Contributions' },
      signal: AbortSignal.timeout(8000),
    })
    if (!response.ok) throw new Error('GitHub unavailable')
    const data = parseContributionCalendar(await response.text())
    if (data.days.length < 300 || data.days.length > 371) throw new Error('Incomplete yearly calendar')
    cached = { at: Date.now(), data }
    return data
  })()
  try { return await pending } finally { pending = undefined }
}

export default {
  async fetch(request) {
    if (request.method !== 'GET') return Response.json({ error: 'Method not allowed' }, { status: 405, headers: { Allow: 'GET', 'Cache-Control': 'no-store' } })
    try {
      return Response.json(await loadCalendar(), { headers: { 'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400' } })
    } catch {
      return Response.json({ error: 'GitHub activity is temporarily unavailable.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
    }
  },
}
