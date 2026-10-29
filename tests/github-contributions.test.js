import assert from 'node:assert/strict'
import { test, mock } from 'node:test'
import calendar, { parseContributionCalendar } from '../api/github-contributions.js'

function day(date, level, count, id = date) {
  return `<td id="${id}" data-date="${date}" data-level="${level}"></td><tool-tip for="${id}">${count === 0 ? 'No' : count} contributions on January 1st.</tool-tip>`
}
const summary = '<h2 id="js-contribution-activity-description">1,611 contributions in the last year</h2>'

test('calendar parser joins tooltip counts by cell ID, sorts dates, and keeps GitHub intensity levels', () => {
  const parsed = parseContributionCalendar(summary + day('2026-01-02', 4, '1,600') + day('2026-01-01', 0, 0))
  assert.equal(parsed.username, 'jztn-zw')
  assert.equal(parsed.total, 1611)
  assert.deepEqual(parsed.days, [{ date: '2026-01-01', count: 0, level: 0 }, { date: '2026-01-02', count: 1600, level: 4 }])
})

test('empty profiles are valid, while missing tooltips, invalid dates, gaps, and duplicate dates fail safely', () => {
  assert.equal(parseContributionCalendar(summary.replace('1,611', '0') + day('2026-01-01', 0, 0)).total, 0)
  for (const invalid of [
    summary,
    summary + '<td data-date="2026-01-01" data-level="0" id="missing"></td>',
    summary + day('2026-02-30', 0, 0),
    summary + day('2026-01-01', 5, 2),
    summary + day('2026-01-01', 0, 3),
    summary + day('2026-01-01', 0, 0, 'first') + day('2026-01-01', 0, 0, 'second'),
    summary + day('2026-01-01', 0, 0) + day('2026-01-03', 0, 0),
  ]) assert.throws(() => parseContributionCalendar(invalid))
})

test('the endpoint rejects writes, handles upstream changes safely, and caches successful reads', async () => {
  const upstream = mock.method(globalThis, 'fetch', async () => new Response('<html>Unavailable</html>'))
  try {
    const denied = await calendar.fetch(new Request('https://portfolio.example/api/github-contributions', { method: 'POST' }))
    assert.equal(denied.status, 405)
    assert.equal(upstream.mock.callCount(), 0)
    const unavailable = await calendar.fetch(new Request('https://portfolio.example/api/github-contributions'))
    assert.equal(unavailable.status, 503)
    assert.deepEqual(await unavailable.json(), { error: 'GitHub activity is temporarily unavailable.' })
    assert.equal(unavailable.headers.get('cache-control'), 'no-store')

    const days = Array.from({ length: 365 }, (_, index) => {
      const date = new Date(Date.UTC(2025, 0, 1) + index * 86400000).toISOString().slice(0, 10)
      return day(date, index === 0 ? 1 : 0, index === 0 ? 1 : 0)
    }).join('')
    upstream.mock.mockImplementation(async url => {
      assert.equal(url, 'https://github.com/users/jztn-zw/contributions')
      return new Response(summary.replace('1,611', '1') + days)
    })
    const response = await calendar.fetch(new Request('https://portfolio.example/api/github-contributions'))
    assert.equal(response.status, 200)
    assert.equal((await response.json()).days.length, 365)
    assert.match(response.headers.get('cache-control'), /s-maxage=3600/)
    const cached = await calendar.fetch(new Request('https://portfolio.example/api/github-contributions?username=someone-else'))
    assert.equal((await cached.json()).username, 'jztn-zw')
    assert.equal(upstream.mock.callCount(), 2)
  } finally { upstream.mock.restore() }
})
