export type ContributionDay = { date: string; count: number; level: number }
export type ContributionCalendar = { username: string; total: number; days: ContributionDay[] }
let pending: Promise<ContributionCalendar> | undefined

export function getGitHubCalendar() {
  pending ??= fetch('/api/github-contributions', { signal: AbortSignal.timeout(12000) })
    .then(async response => {
      if (!response.ok) throw new Error('Calendar unavailable')
      const data: ContributionCalendar = await response.json()
      if (data.username !== 'jztn-zw' || !Number.isSafeInteger(data.total) || data.total < 0
        || !Array.isArray(data.days) || data.days.length < 300 || data.days.length > 371
        || data.days.some(day => !/^\d{4}-\d{2}-\d{2}$/.test(day.date) || !Number.isFinite(Date.parse(day.date))
          || !Number.isSafeInteger(day.count) || day.count < 0 || !Number.isInteger(day.level) || day.level < 0 || day.level > 4)) throw new Error('Invalid calendar')
      return data
    }).catch(error => { pending = undefined; throw error })
  return pending
}
