import { useEffect, useId, useRef } from 'react'
import { advanceFrameDeadline, createFrameTask } from '../lib/frameTask'
import { observePageCover } from '../lib/pageVisibility'
import { solveSpatialLeg, solveSpiderLeg, spiderFeet, spiderStepOffsets, spiderSwing, spiderClimb, spiderClimbDuration, spiderEnterRate, spiderExitRate, spiderPanicExitRate, spiderPanicSpeed, spiderPatrolLayout, spiderTempo, turnTowards } from './spiderKinematics'
import './CalendarSpider.css'

type Point = { x: number; y: number }
type Cell = Point & { element: SVGRectElement }
type Foot = { position: Point; from: Point; target: Point; started: number; duration: number; moving: boolean; ready: number; cycle: number; lift: number }
type ReachKey = { time: number; point: Point }
type SurfaceVertex = Point & { z: number; u: number; v: number }
const legs = Array.from({ length: 8 }, (_, index) => ({ side: index < 4 ? -1 : 1, row: index % 4 }))
const mix = (a: number, b: number, t: number) => a + (b - a) * t
const smooth = (value: number) => { const t = Math.max(0, Math.min(1, value)); return t * t * t * (t * (t * 6 - 15) + 10) }

// The card occludes back-facing pieces inside its bounds; the active lip is
// y=0 for arrival and startled retreats, or the bottom for a completed patrol.
const lipRadius = 16
const halfTurn = lipRadius * Math.PI / 2
function clipFace(points: SurfaceVertex[], distance: (point: SurfaceVertex) => number) {
  return points.flatMap((point, index) => {
    const previous = points[(index + points.length - 1) % points.length]
    const value = distance(point), previousValue = distance(previous)
    const inside = value >= 0, wasInside = previousValue >= 0
    const t = previousValue / (previousValue - value)
    const crossing = inside !== wasInside ? [{ x: mix(previous.x, point.x, t), y: mix(previous.y, point.y, t), z: mix(previous.z, point.z, t), u: mix(previous.u, point.u, t), v: mix(previous.v, point.v, t) }] : []
    return inside ? [...crossing, point] : crossing
  })
}
function visibleSurfaceFaces(points: SurfaceVertex[], bottom: boolean, height: number) {
  return [clipFace(points, point => point.z), clipFace(clipFace(points, point => -point.z - .0001), point => bottom ? point.y - height : -point.y)]
}
function surfacePoint(point: Point, height = 0) {
  const s = point.y + halfTurn
  if (s < -halfTurn) return { x: point.x, y: -s - halfTurn, z: -lipRadius - height }
  if (s > halfTurn) return { x: point.x, y: s - halfTurn, z: lipRadius + height }
  return { x: point.x, y: -(lipRadius + height) * Math.cos(s / lipRadius), z: (lipRadius + height) * Math.sin(s / lipRadius) }
}
const polygonPath = (points: Point[]) => points.length < 3 ? '' : `M${points.map(point => `${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join('L')}Z`

function sampleReach(keys: ReachKey[], time: number) {
  for (let index = 1; index < keys.length; index++) {
    if (time > keys[index].time) continue
    const from = keys[index - 1]
    const to = keys[index]
    const progress = Math.max(0, Math.min(1, (time - from.time) / Math.max(1, to.time - from.time)))
    const moving = Math.hypot(to.point.x - from.point.x, to.point.y - from.point.y) > .1
    return { position: { x: mix(from.point.x, to.point.x, smooth(progress)), y: mix(from.point.y, to.point.y, smooth(progress)) }, lift: moving ? Math.pow(Math.sin(progress * Math.PI), 1.4) : 0 }
  }
  return { position: keys.at(-1)!.point, lift: 0 }
}

// Tapered surfaces keep the long legs sharp and readable at the calendar's scale.
function armorSegment(a: Point, b: Point, width: number, tip: number, draw = polygonPath) {
  const length = Math.max(1, Math.hypot(b.x - a.x, b.y - a.y))
  const ux = (b.x - a.x) / length
  const uy = (b.y - a.y) / length
  const p = (distance: number, offset: number): Point => ({ x: a.x + ux * distance - uy * offset, y: a.y + uy * distance + ux * offset })
  return {
    plate: draw([p(2, -width / 2), p(length - 5, -tip / 2), p(length - 1, 0), p(length - 5, tip / 2), p(4, width / 2), p(0, 0)]),
    bevel: draw([p(2, -width / 2), p(length - 5, -tip / 2), p(length - 3, 0), p(3, 0)]),
  }
}

// Sample a rounded route once per resize; movement then uses distance rather than waypoint time.
function makeRoute(points: Point[]) {
  const samples: (Point & { distance: number })[] = []
  const minX = Math.min(...points.map(point => point.x)), maxX = Math.max(...points.map(point => point.x))
  const minY = Math.min(...points.map(point => point.y)), maxY = Math.max(...points.map(point => point.y))
  let distance = 0
  for (let segment = 0; segment < points.length - 1; segment++) {
    const a = points[Math.max(0, segment - 1)]
    const b = points[segment]
    const c = points[segment + 1]
    const d = points[Math.min(points.length - 1, segment + 2)]
    for (let step = 0; step < 32; step++) {
      const t = step / 32
      const coordinate = (key: 'x' | 'y') => .5 * (2 * b[key] + (-a[key] + c[key]) * t + (2 * a[key] - 5 * b[key] + 4 * c[key] - d[key]) * t * t + (-a[key] + 3 * b[key] - 3 * c[key] + d[key]) * t * t * t)
      const point = { x: Math.max(minX, Math.min(maxX, coordinate('x'))), y: Math.max(minY, Math.min(maxY, coordinate('y'))) }
      const last = samples.at(-1)
      if (last) distance += Math.hypot(point.x - last.x, point.y - last.y)
      samples.push({ ...point, distance })
    }
  }
  const end = points.at(-1)!
  const last = samples.at(-1)!
  distance += Math.hypot(end.x - last.x, end.y - last.y)
  samples.push({ ...end, distance })
  return { samples, distance }
}

export default function CalendarSpider() {
  const overlayRef = useRef<SVGSVGElement>(null)
  const scareRef = useRef<(() => void) | null>(null)
  const edgeClipId = useId()
  const shellClipId = useId()

  useEffect(() => {
    const overlay = overlayRef.current
    const panel = overlay?.parentElement
    const graph = panel?.querySelector<HTMLElement>('.github-calendar-scroll')
    const matrix = panel?.querySelector<HTMLElement>('.github-calendar-matrix')
    const sprite = overlay?.querySelector<SVGGElement>('.calendar-spider-position')
    const body = overlay?.querySelector<SVGGElement>('.calendar-spider-body')
    const chassis = overlay?.querySelector<SVGGElement>('.calendar-spider-chassis')
    const shellSurface = overlay?.querySelector<SVGGElement>('.calendar-spider-shell-surface')
    const shellClip = overlay?.querySelector<SVGPathElement>('.calendar-spider-shell-clip')
    const shellShadow = overlay?.querySelector<SVGEllipseElement>('.calendar-spider-shadow')
    const shellSide = overlay?.querySelector<SVGPathElement>('.calendar-spider-shell-side')
    const hitTarget = overlay?.querySelector<SVGPathElement>('.calendar-spider-hit')
    const frontClip = overlay?.querySelector<SVGRectElement>('.calendar-spider-front-clip')
    const bottomClip = overlay?.querySelector<SVGRectElement>('.calendar-spider-bottom-clip')
    if (!overlay || !panel || !graph || !matrix || !sprite || !body) return
    body.removeAttribute('transform')
    const limbPaths = [...overlay.querySelectorAll<SVGPathElement>('[data-limb]')]
    const hinges = [...overlay.querySelectorAll<SVGGElement>('[data-hinge]')]
    const legShadows = [...overlay.querySelectorAll<SVGPathElement>('[data-leg-shadow]')]
    const contacts = [...overlay.querySelectorAll<SVGEllipseElement>('[data-foot-contact]')]
    const impacts = [...overlay.querySelectorAll<SVGGElement>('.calendar-spider-impact')]
    const shellFacets = [...overlay.querySelectorAll<SVGPathElement>('[data-shell-facet]')]
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const animations = new Set<Animation>()
    const climbLandings = new Set<string>()
    const section = panel.closest<HTMLElement>('.github-calendar')
    let route = makeRoute([{ x: 0, y: -80 }, { x: 1, y: -80 }])
    let patrolRoute = route
    let fleeing = false
    let fleeFromAbove = false
    let fleeStarted = 0
    let position = { x: 0, y: -100 }
    let panelWidth = 0
    let panelHeight = 0
    let entryX = 0
    let entering = true
    let currentClimbTime = 0
    let exiting = false
    let reversingClimb = false
    let exitAngle = 0
    let exitProgress = 0
    let exitPoint: Point = { x: 0, y: -26 }
    let cells: Cell[] = []
    let scale = .78
    let speed = 24
    let elapsed = 0
    let stepClock = 0
    let motionRate = 1
    let cadence = 3.4
    let previousTime = 0
    let travelled = 0
    let restUntil = 0
    let lastLift = -1000
    let feet: Foot[] = []
    let angle = 0
    let headingError = 0
    let impactIndex = 0
    let frame = 0
    let restTimer: ReturnType<typeof setTimeout> | undefined
    let visible = false
    let covered = false
    // Avoid computing this complex SVG more than 60 times/second on constrained
    // devices with high-refresh displays. The pose, gait and elapsed time stay intact.
    const frameInterval = document.documentElement.dataset.effects === 'lite' ? 1000 / 60 : 0
    let nextPaint = 0
    const footprints = impacts.map(() => ({ born: -1000, x: 0, y: 0 }))

    const measureCells = () => {
      const bounds = panel.getBoundingClientRect()
      const viewport = graph.getBoundingClientRect()
      cells = [...graph.querySelectorAll<SVGRectElement>('rect.github-day:not(.github-day-pop)')].flatMap(element => {
        const box = element.getBoundingClientRect()
        if (box.left < viewport.left || box.right > viewport.right) return []
        return [{ element, x: box.left + box.width / 2 - bounds.left, y: box.top + box.height / 2 - bounds.top }]
      })
    }
    const measure = () => {
      const bounds = panel.getBoundingClientRect()
      const grid = graph.getBoundingClientRect()
      const top = grid.top - bounds.top
      const bottom = grid.bottom - bounds.top
      const width = bounds.width
      panelWidth = width
      panelHeight = bounds.height
      const patrol = spiderPatrolLayout(width, bounds.height, top, bottom)
      scale = patrol.scale
      entryX = patrol.entryX
      speed = patrol.speed
      overlay.setAttribute('viewBox', `0 -56 ${width} ${bounds.height + 112}`)
      frontClip?.setAttribute('width', String(width))
      frontClip?.setAttribute('height', String(Math.max(0, bounds.height)))
      bottomClip?.setAttribute('width', String(width))
      bottomClip?.setAttribute('y', String(bounds.height))
      patrolRoute = makeRoute(patrol.points)
      if (!fleeing) route = patrolRoute
      feet = []
      measureCells()
    }
    const pulse = (x: number, y: number) => {
      if (y < 0 || y > panelHeight) return
      const radius = scale * 72
      const nearby = cells.map(cell => ({ ...cell, distance: Math.hypot(cell.x - x, cell.y - y) }))
        .filter(cell => cell.distance < radius && !cell.element.classList.contains('is-selected'))
        .sort((a, b) => a.distance - b.distance).slice(0, 5)
      // Contacts on the lip must not resemble square openings in the card.
      if (!nearby.length) return
      const index = impactIndex++ % impacts.length
      footprints[index] = { x, y, born: elapsed }
      nearby.forEach((cell, rank) => {
          const animation = cell.element.animate([
            { fill: 'var(--day-color)', transform: 'translateY(0) scale(1)', filter: 'drop-shadow(0 0 0 transparent)' },
            { fill: 'var(--numbers-accent)', transform: `translateY(${rank === 0 ? -2 : -1}px) scale(${rank === 0 ? 1.13 : 1.04})`, filter: 'drop-shadow(0 0 3px var(--numbers-accent))', offset: .22 },
            { fill: 'var(--day-color)', transform: 'translateY(0) scale(1)', filter: 'drop-shadow(0 0 0 transparent)' },
          ], { duration: 650, delay: rank * 35, easing: 'cubic-bezier(.22,1,.36,1)' })
          animations.add(animation)
          animation.onfinish = () => animations.delete(animation)
        })
    }
    const tick = (now: number) => {
      frame = 0
      if (!visible || covered || motion.matches || document.hidden) return
      if (restUntil > now) {
        scheduleTick(now)
        return
      }
      if (frameInterval && now + .5 < nextPaint) { frame = requestAnimationFrame(tick); return }
      nextPaint = advanceFrameDeadline(now, nextPaint, frameInterval)
      // Show every first step after the section's own scroll entrance has finished.
      if (entering && section?.dataset.scrollState && section.dataset.scrollState !== 'visible') {
        currentClimbTime = 0
        previousTime = 0
        overlay.style.opacity = '0'
        frame = requestAnimationFrame(tick)
        return
      }
      const waking = restUntil !== 0
      const dt = previousTime && !waking ? Math.min(50, now - previousTime) : 0
      if (waking && previousTime) elapsed += Math.max(0, restUntil - previousTime)
      previousTime = now
      elapsed += dt
      const panic = fleeing ? smooth((elapsed - fleeStarted) / 220) : 0
      const targetRate = fleeing ? mix(1.7, spiderPanicSpeed, panic) : spiderTempo(elapsed)
      motionRate += (targetRate - motionRate) * (1 - Math.exp(-dt / (fleeing ? 100 : 240)))
      const targetCadence = entering || exiting ? (fleeing ? 9.6 : 3.4) : Math.min(fleeing ? 8.2 : 5.2, motionRate * 2.1)
      cadence += (targetCadence - cadence) * (1 - Math.exp(-dt / (fleeing ? 100 : 180)))
      stepClock += dt * cadence
      if (waking) {
        travelled = 0
        restUntil = 0
        fleeing = false
        fleeFromAbove = false
        reversingClimb = false
        route = patrolRoute
        feet = []
        headingError = 0
        lastLift = stepClock - 1000
        entering = true
        currentClimbTime = 0
        climbLandings.clear()
      }
      const walking = !restUntil
      if (overlay.style.opacity !== '1') overlay.style.opacity = '1'
      if (sprite.getAttribute('aria-hidden') !== 'false') sprite.setAttribute('aria-hidden', 'false')
      const lifted = feet.filter(foot => foot.moving).length
      const footDebt = Math.max(0, ...feet.map((foot, index) => {
        const rest = spiderFeet[legs[index].row]
        const local = { x: rest.x * legs[index].side, y: rest.y }
        const goal = { x: position.x + (local.x * Math.cos(angle) - local.y * Math.sin(angle)) * scale, y: position.y + (local.x * Math.sin(angle) + local.y * Math.cos(angle)) * scale }
        return Math.hypot(foot.position.x - goal.x, foot.position.y - goal.y) / scale
      }))
      // Ease almost to a stop while steering, so the body turns before advancing.
      const steering = Math.max(0, Math.min(1, (.45 - Math.abs(headingError)) / .3))
      const pace = speed * motionRate
      const turnRate = fleeing ? 4.6 : 1.25 + .65 * motionRate
      const support = (lifted >= 4 ? .65 : 1) * (1 - smooth((footDebt - 36) / 20))
      if (walking && !entering && !exiting) {
        travelled = Math.min(route.distance, travelled + dt / 1000 * pace * steering * support)
      }
      const readyToFold = fleeing || (lifted === 0 && footDebt < 12)
      if (travelled >= route.distance && Math.abs(headingError) < .12 && readyToFold && !restUntil && !entering && !exiting) {
        if (fleeFromAbove) {
          restUntil = now + 5000
          overlay.style.opacity = '0'
          sprite.setAttribute('aria-hidden', 'true')
          sprite.blur()
        } else {
          exiting = true
          exitProgress = 0
          const last = route.samples.at(-1)!
          exitPoint = { x: last.x, y: last.y }
          climbLandings.clear()
        }
      }
      const distance = travelled
      const nextIndex = route.samples.findIndex(point => point.distance >= distance)
      const next = route.samples[nextIndex < 0 ? route.samples.length - 1 : Math.max(1, nextIndex)]
      const before = route.samples[Math.max(0, (nextIndex < 0 ? route.samples.length - 1 : nextIndex) - 1)]
      const t = Math.min(1, Math.max(0, (distance - before.distance) / Math.max(.001, next.distance - before.distance)))
      let x = mix(before.x, next.x, t)
      let y = mix(before.y, next.y, t)
      const travelHeading = Math.atan2(next.y - before.y, next.x - before.x)
      // The head leads the route, matching the forward walk cycle in the reference.
      const desired = fleeing && route.distance < 1 ? 0 : travelHeading + Math.PI / 2
      if (!feet.length) angle = desired
      else angle = turnTowards(angle, desired, dt / 1000 * turnRate * (footDebt > 32 ? (fleeing ? .82 : .7) : 1))
      headingError = Math.atan2(Math.sin(desired - angle), Math.cos(desired - angle))
      const bottomExit = exiting && !fleeing
      let climbAge = 0
      const climbSupport = .72 + .28 * (1 - smooth((footDebt - 34) / 26))
      if (entering) {
        currentClimbTime += dt * spiderEnterRate * climbSupport
        climbAge = currentClimbTime
        x = entryX - 10 * (1 - smooth(climbAge / 4300))
        // Reach around from the hidden back, raise the shell over the lip,
        // then flatten onto the front. No approach through neighboring content.
        y = spiderClimb(climbAge)
        angle = Math.PI - .24 * (1 - smooth((climbAge - 1200) / 3100))
        if (climbAge >= spiderClimbDuration) { entering = false; headingError = 0 }
      } else if (exiting) {
        exitProgress += dt * (fleeing ? spiderPanicExitRate : spiderExitRate) * climbSupport
        climbAge = exitProgress
        x = exitPoint.x
        const edgeDistance = spiderClimb(spiderClimbDuration - climbAge)
        const startY = bottomExit ? panelHeight - 74 : 74
        y = (bottomExit ? panelHeight - edgeDistance : edgeDistance) + (exitPoint.y - startY) * (1 - smooth(climbAge / 1200))
        angle = reversingClimb ? exitAngle : turnTowards(angle, bottomExit ? Math.PI : 0, dt / 1000 * turnRate)
        if (climbAge >= spiderClimbDuration) {
          exiting = false
          restUntil = now + 5000
          overlay.style.opacity = '0'
          sprite.setAttribute('tabindex', '-1')
          sprite.setAttribute('aria-hidden', 'true')
          sprite.blur()
        }
      }
      position = { x, y }
      const mode = restUntil ? 'hidden' : exiting ? 'exiting' : entering ? (climbAge < 500 ? 'climbing' : 'entering') : fleeing ? 'fleeing' : 'walking'
      if (overlay.dataset.mode !== mode) overlay.dataset.mode = mode
      const tabIndex = !restUntil && !fleeing && !exiting && (!entering || climbAge > 500) ? '0' : '-1'
      if (sprite.getAttribute('tabindex') !== tabIndex) sprite.setAttribute('tabindex', tabIndex)
      const toWorld = (point: Point): Point => ({ x: x + (point.x * Math.cos(angle) - point.y * Math.sin(angle)) * scale, y: y + (point.x * Math.sin(angle) + point.y * Math.cos(angle)) * scale })
      const toLocal = (point: Point): Point => ({ x: ((point.x - x) * Math.cos(angle) + (point.y - y) * Math.sin(angle)) / scale, y: (-(point.x - x) * Math.sin(angle) + (point.y - y) * Math.cos(angle)) / scale })
      const folding = entering || exiting || fleeFromAbove
      const visibleFaces = (points: SurfaceVertex[]) => visibleSurfaceFaces(points, bottomExit, panelHeight)
      const wrap = (point: Point, height = 0) => {
        if (!folding) return { x: point.x + height * scale * .12, y: point.y - height * scale * .35, z: lipRadius + height * scale }
        const edgePoint = bottomExit ? { x: point.x, y: panelHeight - point.y } : point
        const projected = surfacePoint(edgePoint, height * scale)
        const frontTilt = smooth((edgePoint.y + halfTurn) / halfTurn) * height * scale
        return { x: projected.x + .12 * frontTilt, y: (bottomExit ? panelHeight - projected.y : projected.y) - .35 * frontTilt, z: projected.z }
      }
      const surfacePolygon = (points: Point[], height: (point: Point) => number = () => 0) => folding ? visibleFaces(points.map(point => ({ ...wrap(toWorld(point), height(point)), u: point.x, v: point.y }))).map(face => polygonPath(face.map(toLocal))).join(' ') : polygonPath(points)
      hitTarget?.setAttribute('d', surfacePolygon([{ x: -82, y: -120 }, { x: 82, y: -120 }, { x: 97, y: -102 }, { x: 97, y: 86 }, { x: 78, y: 98 }, { x: -78, y: 98 }, { x: -97, y: 80 }, { x: -97, y: -102 }]))
      // Rounding either lip turns the shell through a raised side profile.
      const edgeDistance = bottomExit ? panelHeight - y : y
      const s = edgeDistance + halfTurn
      const turning = folding && s >= -halfTurn && s <= halfTurn
      const depth = folding ? s < -halfTurn ? -1 : s > halfTurn ? 1 : Math.sin(s / lipRadius) : 1
      const depthSlope = turning ? Math.cos(s / lipRadius) * (bottomExit ? -1 : 1) : 0
      const sin = Math.sin(angle), cos = Math.cos(angle)
      const shellCenter = wrap({ x, y }, 3)
      const shellOffset = toLocal(shellCenter)
      const shellMatrix = { a: cos * cos + depth * sin * sin, b: (depth - 1) * sin * cos, d: sin * sin + depth * cos * cos }
      shellSurface?.setAttribute('transform', `matrix(${shellMatrix.a} ${shellMatrix.b} ${shellMatrix.b} ${shellMatrix.d} ${shellOffset.x} ${shellOffset.y})`)
      const shellVertex = (point: Point, height = 3): SurfaceVertex => {
        const raw = toWorld(point)
        const center = wrap({ x, y }, height)
        return { x: raw.x, y: center.y + (raw.y - y) * depth, z: center.z + (raw.y - y) * depthSlope, u: point.x, v: point.y }
      }
      const outline = [{ x: 0, y: -39 }, { x: 17, y: -26 }, { x: 14, y: -10 }, { x: 22, y: 7 }, { x: 13, y: 29 }, { x: 0, y: 40 }, { x: -13, y: 29 }, { x: -22, y: 7 }, { x: -14, y: -10 }, { x: -17, y: -26 }]
      shellSide?.setAttribute('d', folding ? outline.map((point, index) => {
        const nextPoint = outline[(index + 1) % outline.length]
        return visibleFaces([shellVertex(point, 3), shellVertex(nextPoint, 3), shellVertex(nextPoint, -9), shellVertex(point, -9)]).map(face => polygonPath(face.map(toLocal))).join(' ')
      }).join(' ') : '')
      const facets = [
        [[0, -39, 3], [-17, -26, 3], [-10, -12, 12], [0, -10, 22], [0, -34, 12]],
        [[0, -39, 3], [17, -26, 3], [10, -12, 12], [0, -10, 22], [0, -34, 12]],
        [[-14, -10, 3], [-22, 7, 3], [-13, 29, 3], [0, 31, 16], [0, -6, 22]],
        [[14, -10, 3], [22, 7, 3], [13, 29, 3], [0, 31, 16], [0, -6, 22]],
        [[-13, 29, 3], [0, 40, 3], [0, 31, 16]],
        [[13, 29, 3], [0, 40, 3], [0, 31, 16]],
        [[-8, -27, 15], [8, -27, 15], [6, -18, 20], [-6, -18, 20]],
      ]
      facets.forEach((facet, index) => {
        shellFacets[index].setAttribute('d', folding ? visibleFaces(facet.map(([fx, fy, height]) => shellVertex({ x: fx, y: fy }, height))).map(face => polygonPath(face.map(toLocal))).join(' ') : '')
        shellFacets[index].style.opacity = String(turning ? Math.pow(1 - Math.abs(depth), .55) : 0)
      })
      const shellBounds = [{ x: -60, y: -60 }, { x: 60, y: -60 }, { x: 60, y: 60 }, { x: -60, y: 60 }]
      shellClip?.setAttribute('d', folding ? visibleFaces(shellBounds.map(point => shellVertex(point))).map(face => polygonPath(face.map(point => ({ x: point.u, y: point.v })))).join(' ') : polygonPath(shellBounds))
      shellShadow?.style.setProperty('opacity', String(folding ? smooth(edgeDistance / 55) * .12 : .12))
      sprite.setAttribute('transform', `translate(${x} ${y}) rotate(${angle * 180 / Math.PI}) scale(${scale})`)
      body.style.setProperty('--virus-pulse', String(.8 + Math.sin(elapsed / 1500) * .15))
      let activeFeet = lifted
      let bodyLift = 0
      let weightShift = 0
      const climbing = entering || exiting
      const maxLifted = 3
      const nextFoot = feet.map((foot, index) => {
        const { side, row } = legs[index]
        const rest = { x: side * spiderFeet[row].x, y: spiderFeet[row].y }
        const goal = toWorld(rest)
        const debt = Math.hypot(foot.position.x - goal.x, foot.position.y - goal.y) / scale
        const phase = stepClock / 2200 + spiderStepOffsets[index]
        const cycle = Math.floor(phase)
        const swingWindow = phase - cycle < spiderSwing
        const heldHook = entering && row === 0 && climbAge < 1500
        return { index, debt, eligible: swingWindow && cycle !== foot.cycle && !foot.moving && foot.lift < .12 && !heldHook && !feet[(index + 4) % 8]?.moving && stepClock >= foot.ready }
      }).filter(candidate => candidate.eligible).sort((a, b) => b.debt - a.debt)[0]?.index
      legs.forEach(({ side, row }, index) => {
        const rest = { x: side * spiderFeet[row].x, y: spiderFeet[row].y }
        const ideal = toWorld(rest)
        const footState = feet[index] ??= { position: ideal, from: ideal, target: ideal, started: 0, duration: 2200 * spiderSwing, moving: false, ready: stepClock, cycle: -1, lift: 0 }
        const stretch = Math.hypot(footState.position.x - ideal.x, footState.position.y - ideal.y) / scale
        if (index === nextFoot && walking && activeFeet < maxLifted && stepClock - lastLift > 95 && stretch > 8) {
          const pivoting = !climbing && Math.abs(headingError) > .22
          const settling = !climbing && travelled >= route.distance
          const lead = pivoting || settling ? 0 : climbing ? scale * (fleeing ? 36 : 28) : Math.min(scale * (fleeing ? 35 : 27), scale * 8 + pace * .5)
          const predicted = climbing ? angle : turnTowards(angle, desired, fleeing ? .38 : .24)
          footState.from = { ...footState.position }
          const direction = reversingClimb ? -1 : 1
          footState.target = { x: x + (rest.x * Math.cos(predicted) - rest.y * Math.sin(predicted)) * scale + Math.sin(angle) * lead * direction, y: y + (rest.x * Math.sin(predicted) + rest.y * Math.cos(predicted)) * scale - Math.cos(angle) * lead * direction }
          footState.started = stepClock
          footState.cycle = Math.floor(stepClock / 2200 + spiderStepOffsets[index])
          footState.moving = true
          lastLift = stepClock
          activeFeet++
        }
        let lift = footState.moving ? 0 : footState.lift * Math.exp(-dt / 70)
        if (entering && row === 0 && climbAge < 1500) {
          const offset = side > 0 ? 340 : 0
          const behind = { x: entryX - rest.x * scale, y: -138 - rest.y * scale }
          const hook = { x: behind.x, y: -halfTurn }
          const first = { x: behind.x, y: 14 }
          const keys: ReachKey[] = [{ time: 0, point: behind }, { time: offset, point: behind }, { time: offset + 380, point: hook }, { time: offset + 560, point: hook }, { time: offset + 900, point: first }]
          const reach = sampleReach(keys, climbAge)
          keys.forEach((key, keyIndex) => {
            if (!keyIndex || climbAge < key.time || key.point.y < 0 || Math.hypot(key.point.x - keys[keyIndex - 1].point.x, key.point.y - keys[keyIndex - 1].point.y) < 1) return
            const landing = `${index}-${key.time}`
            if (!climbLandings.has(landing)) { climbLandings.add(landing); pulse(key.point.x, key.point.y) }
          })
          lift = reach.lift
          footState.position = reach.position
          footState.moving = false
          footState.ready = stepClock + index * 37
        }
        if (footState.moving) {
          const progress = Math.min(1, (stepClock - footState.started) / footState.duration)
          const eased = smooth(progress)
          footState.position = { x: mix(footState.from.x, footState.target.x, eased), y: mix(footState.from.y, footState.target.y, eased) }
          lift = Math.pow(Math.sin(progress * Math.PI), 1.4)
          if (progress >= 1) {
            footState.moving = false
            footState.ready = stepClock + 100
            activeFeet--
            if (walking && footState.position.y >= 0) pulse(footState.position.x, footState.position.y)
          }
        }
        footState.lift = lift
        // Planted feet stay fixed on the card as the body passes over them.
        const planted = toLocal(footState.position)
        bodyLift += lift
        weightShift += side * lift
        const bodyHip = { x: side * 12, y: -18 + row * 12 }
        const groundedHip = { x: side * 23, y: bodyHip.y }
        let footHeight = lift * [16, 14, 15, 13][row] * mix(1, .58, panic)
        const solved = solveSpiderLeg(groundedHip, planted, row, side, footHeight)
        const kneeHeight = solved.kneeHeight
        footHeight = solved.foot.z
        const footX = solved.foot.x, footY = solved.foot.y
        const kneeX = solved.knee.x, kneeY = solved.knee.y
        if (!folding && solved.limited && !footState.moving) footState.position = toWorld(solved.foot)
        const hip = groundedHip
        const knee = { x: kneeX, y: kneeY }
        const foot = { x: footX, y: footY }
        const ankle = { x: mix(knee.x, foot.x, .82), y: mix(knee.y, foot.y, .82) }
        const ankleHeight = mix(kneeHeight, footHeight, .82)
        const projectedHip = wrap(toWorld(hip), 8)
        const coxaRoot = bodyHip
        const projectedRoot = wrap(toWorld(coxaRoot), 8)
        let projectedKnee = wrap(toWorld(knee), kneeHeight)
        const restingKnee = projectedKnee
        let projectedFoot = wrap(toWorld(foot), footHeight)
        if (entering && row === 0) {
          // Hook the articulated knee over the physical border first. This
          // creates a connected arch, rather than two detached toe fragments.
          const stagger = side > 0 ? 340 : 0
          const reach = smooth((climbAge - stagger) / 650) * (1 - smooth((climbAge - 1600) / 800))
          projectedKnee = {
            x: mix(projectedKnee.x, entryX - side * 34 * scale, reach),
            y: mix(projectedKnee.y, -36 * scale, reach),
            z: mix(projectedKnee.z, 3, reach),
          }
        }
        if (folding) {
          const chain = solveSpatialLeg(projectedHip, projectedFoot, projectedKnee, row, scale)
          projectedKnee = chain.knee
          projectedFoot = chain.foot
        }
        const restingAnkle = wrap(toWorld(ankle), ankleHeight)
        const projectedAnkle = folding ? { x: mix(projectedKnee.x, projectedFoot.x, .78), y: mix(projectedKnee.y, projectedFoot.y, .78), z: mix(projectedKnee.z, projectedFoot.z, .78) } : { x: restingAnkle.x + (projectedKnee.x - restingKnee.x) * .24, y: restingAnkle.y + (projectedKnee.y - restingKnee.y) * .24, z: restingAnkle.z + (projectedKnee.z - restingKnee.z) * .24 }
        const drawLegSegment = (a: ReturnType<typeof wrap>, b: ReturnType<typeof wrap>, width: number, tipWidth: number) => {
          const start = toLocal(a), end = toLocal(b)
          return armorSegment(start, end, width, tipWidth, points => {
            const lengthSquared = Math.max(1, (end.x - start.x) ** 2 + (end.y - start.y) ** 2)
            const face = points.map(point => {
              const along = Math.max(0, Math.min(1, ((point.x - start.x) * (end.x - start.x) + (point.y - start.y) * (end.y - start.y)) / lengthSquared))
              return { ...toWorld(point), z: mix(a.z, b.z, along), u: point.x, v: point.y }
            })
            return visibleFaces(face).map(part => polygonPath(part.map(toLocal))).join(' ')
          })
        }
        const coxa = drawLegSegment(projectedRoot, projectedHip, 6, 5)
        const upper = drawLegSegment(projectedHip, projectedKnee, [8, 6, 7, 9][row], [5, 4, 4, 6][row])
        const lower = drawLegSegment(projectedKnee, projectedAnkle, [5, 4, 4, 6][row], 3)
        const tip = drawLegSegment(projectedAnkle, projectedFoot, 3.8, .2)
        limbPaths[index * 3].setAttribute('d', `${coxa.plate} ${upper.plate} ${lower.plate} ${tip.plate}`)
        limbPaths[index * 3 + 1].setAttribute('d', `${coxa.bevel} ${upper.bevel} ${lower.bevel}`)
        limbPaths[index * 3 + 2].setAttribute('d', tip.plate)
        const surfaceKnee = toLocal(projectedKnee)
        hinges[index].setAttribute('transform', `translate(${surfaceKnee.x} ${surfaceKnee.y})`)
        hinges[index].style.opacity = folding && projectedKnee.z < 0 && (bottomExit ? projectedKnee.y < panelHeight : projectedKnee.y > 0) ? '0' : '1'
        legShadows[index].setAttribute('d', folding ? '' : `M${groundedHip.x} ${groundedHip.y + 8} L${kneeX + 4} ${kneeY + 8} ${footX} ${footY}`)
        const groundContact = wrap(footState.position)
        const contact = toLocal(groundContact)
        contacts[index].setAttribute('cx', String(contact.x))
        contacts[index].setAttribute('cy', String(contact.y))
        contacts[index].style.opacity = String(folding && (groundContact.z < 0 || groundContact.y < 0 || groundContact.y > panelHeight) ? 0 : (1 - lift) * .4)
      })
      // Shift the shell's weight, leaving the planted foot positions undisturbed.
      chassis?.setAttribute('transform', `translate(${-weightShift * .65} ${-2 - bodyLift * .45}) rotate(${-weightShift * .65})`)
      footprints.forEach((foot, index) => {
        const age = (elapsed - foot.born) / 650
        impacts[index].style.opacity = age >= 0 && age < 1 ? String((1 - age) * .65) : '0'
        impacts[index].setAttribute('transform', `translate(${foot.x} ${foot.y}) scale(${.35 + Math.min(1, Math.max(0, age)) * 1.5})`)
      })
      scheduleTick(now)
    }
    function scheduleTick(now: number) {
      if (restUntil > now) {
        // The sprite is fully out of view. Wake only when its existing rest ends.
        restTimer = setTimeout(() => {
          restTimer = undefined
          frame = requestAnimationFrame(tick)
        }, restUntil - now)
      } else {
        frame = requestAnimationFrame(tick)
      }
    }
    const sync = () => {
      cancelAnimationFrame(frame)
      clearTimeout(restTimer)
      restTimer = undefined
      previousTime = 0
      nextPaint = 0
      if (visible && !covered && !motion.matches && !document.hidden) scheduleTick(performance.now())
      else {
        animations.forEach(animation => animation.cancel())
        animations.clear()
      }
    }
    scareRef.current = () => {
      if (fleeing || exiting || restUntil || overlay.dataset.mode === 'climbing' || motion.matches || !visible) return
      if (entering) {
        // A startled crawler that is still straddling the lip backs out using
        // the same supports, instead of spinning around its planted forelegs.
        fleeing = true
        fleeStarted = elapsed
        entering = false
        exiting = true
        reversingClimb = true
        exitAngle = angle
        exitPoint = { x: position.x, y: 74 }
        exitProgress = spiderClimbDuration - currentClimbTime
        feet.forEach((foot, index) => { foot.ready = stepClock + index * 30 })
        lastLift = stepClock - 300
        sprite.blur()
        overlay.dataset.mode = 'exiting'
        return
      }
      const exitX = Math.max(65, Math.min(panelWidth - 65, position.x))
      fleeFromAbove = position.y < 0
      route = makeRoute([
        { ...position },
        { x: exitX, y: fleeFromAbove ? -160 : Math.min(74, position.y) },
      ])
      travelled = 0
      fleeing = true
      entering = false
      fleeStarted = elapsed
      headingError = Math.PI
      lastLift = stepClock - 1000
      feet.forEach(foot => { foot.ready = stepClock })
      sprite.blur()
      overlay.dataset.mode = 'fleeing'
    }
    measure()
    const resizeTask = createFrameTask(measure)
    const cellsTask = createFrameTask(measureCells)
    const resize = new ResizeObserver(resizeTask.schedule)
    resize.observe(panel)
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync() }, { threshold: .15 })
    observer.observe(panel)
    graph.addEventListener('scroll', cellsTask.schedule, { passive: true })
    const stopWatchingCover = observePageCover(value => { covered = value; sync() })
    motion.addEventListener('change', sync)
    return () => {
      scareRef.current = null
      cancelAnimationFrame(frame)
      clearTimeout(restTimer)
      resizeTask.cancel()
      cellsTask.cancel()
      resize.disconnect()
      observer.disconnect()
      graph.removeEventListener('scroll', cellsTask.schedule)
      stopWatchingCover()
      motion.removeEventListener('change', sync)
      animations.forEach(animation => animation.cancel())
    }
  }, [])

  return <svg ref={overlayRef} className="calendar-spider-stage" aria-label="Calendar spider" data-mode="entering" focusable="false">
    <defs>
      <clipPath id={edgeClipId} clipPathUnits="userSpaceOnUse"><rect x="0" y="-56" width="100%" height="56" /><rect className="calendar-spider-front-clip" x="0" y="0" width="0" height="0" /><rect className="calendar-spider-bottom-clip" x="0" y="0" width="0" height="56" /></clipPath>
      <clipPath id={shellClipId} clipPathUnits="userSpaceOnUse"><path className="calendar-spider-shell-clip" /></clipPath>
    </defs>
    {Array.from({ length: 16 }, (_, index) => <g key={index} className="calendar-spider-impact" aria-hidden="true"><path d="M0-7 7 0 0 7-7 0Z" /><path d="M-12-3v-4h4m20 10v4H8" /><rect x="-1" y="-1" width="2" height="2" /></g>)}
    <g clipPath={`url(#${edgeClipId})`}>
    <g className="calendar-spider-position" transform="translate(-100 -100)" role="button" tabIndex={0} aria-label="Scare spider away" onClick={event => { event.stopPropagation(); scareRef.current?.() }} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); scareRef.current?.() } }}>
      <path className="calendar-spider-hit" d="M-82-120H82L97-102V86L78 98H-78L-97 80V-102Z" />
      <ellipse className="calendar-spider-shadow" cy="10" rx="42" ry="45" aria-hidden="true" />
      <g className="calendar-spider-body" aria-hidden="true">
        {legs.map((_, index) => <g key={`shadow-${index}`} className="calendar-spider-ground"><path data-leg-shadow="" /><ellipse data-foot-contact="" rx="3.6" ry="2.2" /></g>)}
        {legs.map((_, index) => <g key={index} className="calendar-spider-leg">
          <path data-limb="" fill="var(--spider-armor)" stroke="var(--spider-edge)" strokeWidth=".65" />
          <path data-limb="" fill="var(--spider-highlight)" opacity=".28" />
          <path data-limb="" fill="var(--numbers-accent)" />
          <g data-hinge=""><path d="M-3-2 1-3 3 0 1 3-3 2Z" fill="var(--spider-dark)" stroke="var(--numbers-accent)" strokeWidth=".7" /><path d="M-1 0h2" stroke="var(--spider-highlight)" strokeWidth=".8" /></g>
        </g>)}
        <path className="calendar-spider-shell-side" />
        <g className="calendar-spider-shell-surface"><g clipPath={`url(#${shellClipId})`}><g className="calendar-spider-chassis" transform="translate(0 -2)">
          {/* An original split-shell crawler, with offset plates and a recessed sensor visor. */}
          <path d="M0-39 17-26 14-10 22 7 13 29 0 40-13 29-22 7-14-10-17-26Z" fill="var(--spider-dark)" stroke="var(--spider-edge)" strokeWidth=".85" />
          <path d="M0-37-15-25-11-12-3-17 5-14 12-24Z" fill="var(--numbers-accent)" />
          <path d="m-15-25 4 12 8-4-3-7Z" fill="var(--spider-shell-dark)" />
          <path d="m-12-9-7 16 8 19 8 7V10l-5-8 3-9Z" fill="var(--numbers-accent)" />
          <path d="m12-9 7 16-8 19-8 7V10l5-8-3-9Z" fill="var(--spider-armor)" stroke="var(--spider-edge)" strokeWidth=".7" />
          <path d="M-9-5-14 7-8 21M11-3 15 7 9 23" fill="none" stroke="var(--spider-highlight)" strokeWidth=".9" opacity=".65" />
          <path d="m0 15-4 8 4 11 4-11Z" fill="var(--spider-shell-dark)" />
          <path d="M-11-25-6-28 9-23 8-18-5-20Z" fill="var(--spider-dark)" />
          <g className="calendar-spider-core"><path d="m-7-24 12 4" stroke="var(--spider-shell-light)" strokeWidth="1.8" /><path d="M-2-6V5m4-8v5" stroke="var(--numbers-accent)" strokeWidth="2" /></g>
          <path d="m-16-27-5-10 4-8m33 18 5-7-2-7" fill="none" stroke="var(--spider-edge)" strokeWidth="1.5" />
          <path d="M8 11h4m-5 5h3m-4 5h2M-8 29l8 8 8-8" fill="none" stroke="var(--numbers-accent)" strokeWidth="1.2" />
          <path d="M-10-30-3-35" stroke="var(--spider-highlight)" strokeWidth=".9" />
        </g></g></g>
        {Array.from({ length: 7 }, (_, index) => <path key={`facet-${index}`} data-shell-facet="" className={`calendar-spider-facet calendar-spider-facet-${index}`} />)}
      </g>
    </g>
    </g>
  </svg>
}
