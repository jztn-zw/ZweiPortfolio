import { Activity } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getGitHubCalendar, type ContributionCalendar } from '../lib/githubCalendar'

const dayMilliseconds = 86_400_000
const cellPitch = 12
const levels = [0, 1, 2, 3, 4]
const formatDate = new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: 'UTC' })

export default function MinimalGitHubCalendar() {
  const [calendar, setCalendar] = useState<ContributionCalendar>()
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    getGitHubCalendar().then(data => { if (active) setCalendar(data) })
      .catch(() => { if (active) setFailed(true) })
    return () => { active = false }
  }, [attempt])

  const first = calendar ? new Date(`${calendar.days[0].date}T00:00:00Z`) : undefined
  const start = first ? first.getTime() - first.getUTCDay() * dayMilliseconds : 0
  const week = (date: Date) => Math.floor((date.getTime() - start) / (7 * dayMilliseconds))
  const weeks = calendar ? week(new Date(`${calendar.days.at(-1)!.date}T00:00:00Z`)) + 1 : 53

  return (
    <section className="min-card min-contributions" aria-labelledby="min-contributions-title">
      <div className="min-card-heading">
        <h2 className="min-card-title" id="min-contributions-title"><Activity size={15} aria-hidden="true" />GitHub contributions</h2>
      </div>
      {calendar ? <>
        <p className="min-contributions-summary"><strong>{calendar.total.toLocaleString('en-US')}</strong> {calendar.total === 1 ? 'contribution' : 'contributions'} in the past year</p>
        <svg className="min-contributions-graph" role="img" aria-label="GitHub contribution calendar for the past year" viewBox={`0 0 ${weeks * cellPitch} ${7 * cellPitch}`}>
          {calendar.days.map(day => {
            const date = new Date(`${day.date}T00:00:00Z`)
            return (
              <rect className="min-contribution-cell" key={day.date} data-level={day.level} x={week(date) * cellPitch + 1} y={date.getUTCDay() * cellPitch + 1} width="10" height="10" rx="1.5">
                <title>{`${day.count.toLocaleString('en-US')} ${day.count === 1 ? 'contribution' : 'contributions'} on ${formatDate.format(date)}`}</title>
              </rect>
            )
          })}
        </svg>
        <div className="min-contributions-legend" aria-hidden="true"><span>Less</span>{levels.map(level => <span className="min-contribution-cell" data-level={level} key={level} />)}<span>More</span></div>
      </> : failed ? (
        <div className="min-contributions-unavailable">
          <p role="status">GitHub activity is temporarily unavailable.</p>
          <button className="min-text-link" type="button" onClick={() => { setFailed(false); setAttempt(value => value + 1) }}>Try again</button>
        </div>
      ) : <p className="min-contributions-summary" role="status">Loading GitHub contributions…</p>}
    </section>
  )
}
