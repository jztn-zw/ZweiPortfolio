type Point = { x: number; y: number }

export const spiderFeet = [
  { x: 52, y: -91 }, { x: 91, y: -39 },
  { x: 92, y: 43 }, { x: 60, y: 91 },
]
const upperBones = [52, 55, 55, 51]
const lowerBones = [65, 65, 66, 63]
// A wave passes through opposing legs; 70% of a cycle stays planted.
export const spiderStepOffsets = [0, .625, .25, .875, .5, .125, .75, .375]
export const spiderSwing = .3
export const spiderClimbDuration = 4300
export const spiderEnterRate = 1.25
export const spiderExitRate = 1.4
export const spiderPanicExitRate = 2.8
export const spiderPanicSpeed = 4.4

export function spiderPatrolLayout(width: number, height: number, gridTop: number, gridBottom: number) {
  const compact = width < 600
  const scale = compact ? Math.min(.52, Math.max(.38, height / 360)) : .78
  const edge = compact ? 62 : 88
  const entryX = width - edge
  const exitY = height - 74
  if (!compact) return {
    scale, entryX, speed: 42,
    points: [
      { x: entryX, y: 74 }, { x: entryX, y: gridTop + 30 }, { x: entryX, y: gridBottom - 36 },
      { x: width * .57, y: gridBottom - 32 }, { x: edge, y: gridBottom - 36 },
      { x: edge, y: gridTop + 30 }, { x: width * .38, y: gridTop + 45 },
      { x: width * .65, y: gridBottom - 45 }, { x: entryX, y: gridTop + 30 },
      { x: entryX, y: exitY },
    ],
  }

  // A full year can be only 35–55px tall on a phone. Fixed 30/36px
  // grid insets would reverse the lanes and point the last step upward.
  const clearance = 126 * scale + 4
  const low = clearance
  const high = Math.max(low + 1, height - clearance)
  const clamp = (y: number) => Math.max(low, Math.min(high, y))
  const gridHeight = Math.max(0, gridBottom - gridTop)
  let upper = clamp(gridTop + gridHeight * .25)
  let lower = clamp(gridTop + gridHeight * .75)
  if (lower - upper < Math.min(12, (high - low) * .3)) {
    upper = low + (high - low) * .25
    lower = low + (high - low) * .75
  }
  const approachY = Math.min(exitY - 1, Math.max(low, exitY - Math.min(44, height * .22)))
  return {
    scale, entryX, speed: 27,
    points: [
      { x: entryX, y: 74 }, { x: entryX, y: upper }, { x: width * .6, y: lower },
      { x: edge, y: lower }, { x: edge, y: upper }, { x: width * .4, y: upper },
      { x: width * .65, y: lower },
      // Align on a straight downward approach before wrapping over the lip.
      { x: entryX, y: approachY }, { x: entryX, y: exitY },
    ],
  }
}

export function spiderTempo(time: number) {
  const keys = [[0, 1], [650, 1.7], [1800, 2.05], [2850, .8], [3900, .85], [4700, 1.9], [6100, 2.35], [7350, .9], [9200, 1.05], [10800, 1.6], [12000, 1]]
  const phase = ((time % 12000) + 12000) % 12000
  const index = keys.findIndex(key => key[0] >= phase)
  if (index <= 0) return keys[0][1]
  const from = keys[index - 1], to = keys[index]
  const t = (phase - from[0]) / (to[0] - from[0])
  const blend = t * t * t * (t * (t * 6 - 15) + 10)
  return from[1] + (to[1] - from[1]) * blend
}

// Continuous velocity through the lip prevents the stop/flatten/restart of
// separately eased body movements. Feet still hook before the shell rises.
export function spiderClimb(time: number) {
  const keys = [[0, -138, 0], [320, -138, 0], [1320, -72, .045], [2760, -10, .047], [spiderClimbDuration, 74, 0]]
  if (time <= 0) return -138
  if (time >= spiderClimbDuration) return 74
  const index = keys.findIndex(key => key[0] >= time)
  const from = keys[index - 1], to = keys[index]
  const duration = to[0] - from[0], t = (time - from[0]) / duration
  return (2 * t ** 3 - 3 * t ** 2 + 1) * from[1] + (t ** 3 - 2 * t ** 2 + t) * duration * from[2] + (-2 * t ** 3 + 3 * t ** 2) * to[1] + (t ** 3 - t ** 2) * duration * to[2]
}
type Point3 = Point & { z: number }

export function solveSpatialLeg(hip: Point3, target: Point3, preferred: Point3, row: number, scale: number) {
  const upper = upperBones[row] * scale, lower = lowerBones[row] * scale
  const delta = { x: target.x - hip.x, y: target.y - hip.y, z: target.z - hip.z }
  const actual = Math.hypot(delta.x, delta.y, delta.z)
  const requested = Math.max(.001, actual)
  const distance = Math.max(Math.abs(upper - lower) + scale, Math.min(upper + lower - 4 * scale, requested))
  const unit = actual < .001 ? { x: 1, y: 0, z: 0 } : { x: delta.x / requested, y: delta.y / requested, z: delta.z / requested }
  const foot = { x: hip.x + unit.x * distance, y: hip.y + unit.y * distance, z: hip.z + unit.z * distance }
  const along = (upper ** 2 - lower ** 2 + distance ** 2) / (2 * distance)
  const center = { x: hip.x + unit.x * along, y: hip.y + unit.y * along, z: hip.z + unit.z * along }
  const toward = { x: preferred.x - center.x, y: preferred.y - center.y, z: preferred.z - center.z }
  const parallel = toward.x * unit.x + toward.y * unit.y + toward.z * unit.z
  let bend = { x: toward.x - unit.x * parallel, y: toward.y - unit.y * parallel, z: toward.z - unit.z * parallel }
  let length = Math.hypot(bend.x, bend.y, bend.z)
  if (length < .001) { bend = Math.abs(unit.z) < .9 ? { x: -unit.y, y: unit.x, z: 0 } : { x: 1, y: 0, z: 0 }; length = Math.hypot(bend.x, bend.y, bend.z) }
  const radius = Math.sqrt(Math.max(0, upper ** 2 - along ** 2)) / length
  return { foot, knee: { x: center.x + bend.x * radius, y: center.y + bend.y * radius, z: center.z + bend.z * radius }, upper, lower }
}

export function turnTowards(angle: number, target: number, maxStep: number) {
  const difference = Math.atan2(Math.sin(target - angle), Math.cos(target - angle))
  return angle + Math.max(-maxStep, Math.min(maxStep, difference))
}

// A two-bone chain has fixed lengths. The toe can never pull a shin into a
// long straight spike, even during a pivot or an interrupted climb.
export function solveSpiderLeg(hip: Point, target: Point, row: number, side: number, footHeight: number) {
  const sectors = [[-126, -48], [-70, -5], [8, 76], [54, 126]]
  const minX = [36, 65, 66, 40][row], maxX = [87, 119, 120, 94][row]
  const safe = { x: side * Math.max(minX, Math.min(maxX, side * target.x)), y: Math.max(sectors[row][0], Math.min(sectors[row][1], target.y)), z: footHeight }
  // Solve in a vertical plane: the femur rises, then the shin descends toward
  // an outboard toe. A planar elbow would fold sideways into a square.
  const dx = safe.x - hip.x, dy = safe.y - hip.y
  const span = Math.max(1, Math.hypot(dx, dy))
  const fan = row < 2 ? side : -side
  const preferred = { x: hip.x + dx * .43 - dy / span * fan * 24, y: hip.y + dy * .43 + dx / span * fan * 24, z: 60 }
  const result = solveSpatialLeg({ ...hip, z: 8 }, safe, preferred, row, 1)
  return { ...result, kneeHeight: result.knee.z, limited: Math.hypot(result.foot.x - target.x, result.foot.y - target.y) > .1 }
}
