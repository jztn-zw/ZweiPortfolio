import { ArrowUpRight, CodeXml, RefreshCw } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { getGitHubCalendar, type ContributionCalendar, type ContributionDay } from '../lib/githubCalendar'
import CalendarSpider from './CalendarSpider'
import GraphicMark from './GraphicMark'
import TechnicalNumber from './TechnicalNumber'
import './GitHubCalendar.css'

const dayMilliseconds = 86400000
const dateLabel = (date: string) => new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
const describeDay = (day: ContributionDay) => `${day.count.toLocaleString('en-US')} ${day.count === 1 ? 'contribution' : 'contributions'} on ${dateLabel(day.date)}`

export default function GitHubCalendar() {
  const [calendar, setCalendar] = useState<ContributionCalendar | null>(null)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const graph = useRef<HTMLDivElement>(null)
  const matrix = useRef<HTMLDivElement>(null)
  const tooltip = useRef<HTMLDivElement>(null)
  const interaction = useRef<'pointer' | 'keyboard'>('pointer')
  const helpId = useId()
  const selectionId = useId()

  useEffect(() => {
    let active = true
    getGitHubCalendar().then(data => { if (active) setCalendar(data) })
      .catch(() => { if (active) setFailed(true) })
    return () => { active = false }
  }, [attempt])

  useEffect(() => {
    const element = graph.current
    if (!calendar || !element) return
    const showLatest = () => {
      if (document.activeElement !== element) element.scrollLeft = element.scrollWidth
    }
    showLatest()
    const observer = new ResizeObserver(showLatest)
    observer.observe(element)
    return () => observer.disconnect()
  }, [calendar])

  const first = calendar ? new Date(`${calendar.days[0].date}T00:00:00Z`) : null
  const start = first ? first.getTime() - first.getUTCDay() * dayMilliseconds : 0
  const column = (date: string) => Math.floor((Date.parse(`${date}T00:00:00Z`) - start) / (7 * dayMilliseconds))
  const weeks = calendar ? column(calendar.days.at(-1)!.date) + 1 : 53
  const width = 8 + weeks * 16

  function positionTooltip(cell: SVGRectElement) {
    if (!matrix.current || !tooltip.current) return
    const area = matrix.current.getBoundingClientRect()
    const bounds = cell.getBoundingClientRect()
    const half = tooltip.current.offsetWidth / 2
    const x = Math.max(half + 6, Math.min(area.width - half - 6, bounds.left + bounds.width / 2 - area.left))
    const arrow = Math.max(12, Math.min(half * 2 - 12, bounds.left + bounds.width / 2 - area.left - x + half))
    tooltip.current.style.setProperty('--tooltip-x', `${x}px`)
    tooltip.current.style.setProperty('--tooltip-y', `${bounds.top - area.top - 12}px`)
    tooltip.current.style.setProperty('--tooltip-arrow-x', `${arrow}px`)
  }

  function selectDay(index: number, cell: SVGRectElement) {
    positionTooltip(cell)
    setSelected(index)
  }

  return (
    <section className="github-calendar" aria-labelledby="github-calendar-title">
      <div className="github-calendar-header">
<div><p className="eyebrow"><span className="red">GITHUB / ACTIVITY</span><GraphicMark variant="modules" /></p><h2 id="github-calendar-title">CODE, DAY BY DAY</h2></div>
        <a href="https://github.com/jztn-zw" target="_blank" rel="noreferrer"><CodeXml size={17} aria-hidden="true" /><span>@jztn-zw</span><ArrowUpRight size={15} aria-hidden="true" /></a>
      </div>
      <div className="github-calendar-panel" aria-busy={!calendar && !failed} data-calendar-inspecting={selected !== null}>
        <div className="github-calendar-decoration" aria-hidden="true">
          <span className="github-calendar-watermark">BUILD.</span>
          <span className="github-calendar-slash" />
          <svg className="github-calendar-emblem" viewBox="0 0 140 140" fill="none">
            <circle cx="70" cy="70" r="49" stroke="currentColor" strokeWidth=".8" />
            <circle cx="70" cy="70" r="37" stroke="currentColor" strokeWidth=".6" strokeDasharray="2 7" />
            <path d="M70 7v26m0 74v26M7 70h26m74 0h26M20 20h12m-12 0v12m100-12h-12m12 0v12M20 120h12m-12 0v-12m100 12h-12m12 0v-12" stroke="currentColor" strokeWidth=".8" />
            <path d="m56 59-12 11 12 11m28-22 12 11-12 11m-10-29-8 38" stroke="var(--numbers-accent)" strokeWidth="2" />
            <path d="M70 21a49 49 0 0 1 49 49" stroke="var(--numbers-accent)" strokeWidth="2" />
            <circle cx="70" cy="21" r="3" fill="var(--numbers-accent)" />
          </svg>
        </div>
        {calendar ? <>
          <CalendarSpider />
          <div className="github-calendar-summary">
            <p className="github-calendar-kicker eyebrow"><CodeXml size={15} aria-hidden="true" /> CONTRIBUTION LOG <span className="github-calendar-kicker-rule" aria-hidden="true" /></p>
            <p className="github-calendar-total">
              <strong className="github-calendar-value">
                <TechnicalNumber value={calendar.total.toLocaleString('en-US')} />
                <span className="sr-only">{calendar.total.toLocaleString('en-US')}</span>
                <span className="numbers-metric-tick" aria-hidden="true" />
                <span className="numbers-metric-ruler" aria-hidden="true" />
              </strong>
              <span>CONTRIBUTIONS<span>IN THE LAST YEAR</span></span>
            </p>
          </div>
          <p id={helpId} className="sr-only">Public contribution activity from GitHub. Hover over a day for its count, or focus this calendar and use the arrow keys to explore. Home selects the first day and End selects the latest day.</p>
          <div ref={matrix} className="github-calendar-matrix">
          <div ref={graph} className="github-calendar-scroll" tabIndex={0} role="group" aria-label="GitHub contribution calendar" aria-describedby={`${helpId} ${selectionId}`} onBlur={() => { interaction.current = 'pointer'; setSelected(null) }}
            onScroll={event => {
              if (selected === null) return
              const cell = event.currentTarget.querySelector<SVGRectElement>(`[data-day-index="${selected}"]`)
              if (!cell) return
              const bounds = cell.getBoundingClientRect()
              const viewport = event.currentTarget.getBoundingClientRect()
              if (bounds.right < viewport.left || bounds.left > viewport.right) setSelected(null)
              else positionTooltip(cell)
            }}
            onKeyDown={event => {
              const delta = { ArrowLeft: -7, ArrowRight: 7, ArrowUp: -1, ArrowDown: 1 }[event.key]
              if (delta === undefined && event.key !== 'Home' && event.key !== 'End') return
              event.preventDefault()
              interaction.current = 'keyboard'
              const next = event.key === 'Home' ? 0 : event.key === 'End' ? calendar.days.length - 1 : Math.max(0, Math.min(calendar.days.length - 1, (selected ?? calendar.days.length - 1) + delta!))
              const cell = event.currentTarget.querySelector<SVGRectElement>(`[data-day-index="${next}"]`)
              cell?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' })
              if (cell) selectDay(next, cell)
            }}>
            <svg viewBox={`0 0 ${width} 120`} className="github-calendar-graph" aria-hidden="true" onPointerLeave={() => { if (interaction.current === 'pointer') setSelected(null) }} onPointerMove={event => {
              if (interaction.current !== 'keyboard') return
              interaction.current = 'pointer'
              const cell = event.target instanceof Element ? event.target.closest<SVGRectElement>('[data-day-index]') : null
              if (cell) selectDay(Number(cell.dataset.dayIndex), cell)
            }}>
              {calendar.days.map((day, index) => {
                const x = 6 + column(day.date) * 16
                const y = 6 + new Date(`${day.date}T00:00:00Z`).getUTCDay() * 16
                return <g key={day.date} onPointerEnter={event => {
                  if (interaction.current === 'keyboard') return
                  const cell = event.currentTarget.querySelector<SVGRectElement>('[data-day-index]')
                  if (cell) selectDay(index, cell)
                }}>
                  <rect data-day-index={index} x={x - 2} y={y - 2} width="16" height="16" className="github-day-hit" />
                  <rect data-level={day.level} className={`github-day${selected === index ? ' is-selected' : ''}`} x={x} y={y} width="12" height="12" rx="1" />
                </g>
              })}
              {selected !== null && <g key={calendar.days[selected].date} className="github-day-selection" transform={`translate(${6 + column(calendar.days[selected].date) * 16} ${6 + new Date(`${calendar.days[selected].date}T00:00:00Z`).getUTCDay() * 16})`}>
                <rect data-level={calendar.days[selected].level} className="github-day github-day-pop" width="12" height="12" rx="1.5" />
                <path className="github-day-brackets" d="M-3 1v-4h4m10 0h4v4M-3 11v4h4m10 0h4v-4" pathLength="1" />
              </g>}
            </svg>
          </div>
          <div ref={tooltip} className="github-calendar-tooltip" data-visible={selected !== null} aria-hidden="true">
            <div><span className="github-tooltip-dot" /><strong>{selected === null ? '' : calendar.days[selected].count.toLocaleString('en-US')}</strong><span>{selected !== null && calendar.days[selected].count === 1 ? 'contribution' : 'contributions'}</span></div>
            <span>{selected === null ? '' : dateLabel(calendar.days[selected].date)}</span>
          </div>
          <p id={selectionId} className="sr-only" aria-live="polite">{selected === null ? '' : describeDay(calendar.days[selected])}</p>
          <div className="github-calendar-footer">
            <span className="github-calendar-readout-mark" aria-hidden="true" />
            <div className="github-calendar-legend" aria-label="Contribution intensity: less to more"><span>Less</span>{[0, 1, 2, 3, 4].map(level => <span key={level} data-level={level} className="github-day" aria-hidden="true" />)}<span>More</span></div>
          </div>
          </div>
        </> : failed ? <div className="github-calendar-empty"><CodeXml size={28} strokeWidth={1.2} aria-hidden="true" /><p>GitHub activity is temporarily unavailable.</p><button type="button" onClick={() => { setFailed(false); setAttempt(value => value + 1) }}><RefreshCw size={14} aria-hidden="true" />Try again</button></div>
          : <div className="github-calendar-loading" role="status"><span>Loading contributions from GitHub…</span><div aria-hidden="true" /></div>}
      </div>
    </section>
  )
}
