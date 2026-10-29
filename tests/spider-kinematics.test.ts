import assert from 'node:assert/strict'
import { test } from 'node:test'
import { solveSpatialLeg, solveSpiderLeg, spiderStepOffsets, spiderSwing, spiderClimb, spiderClimbDuration, spiderExitRate, spiderPanicExitRate, spiderPanicSpeed, spiderPatrolLayout, spiderTempo, turnTowards } from '../src/components/spiderKinematics.ts'

const near = (actual: number, expected: number) => assert.ok(Math.abs(actual - expected) < 1e-7, `${actual} differs from ${expected}`)

test('ground legs keep fixed bone lengths and upward arches under extreme reach and pivots', () => {
  for (let row = 0; row < 4; row++) for (const side of [-1, 1]) {
    const hip = { x: side * 23, y: -18 + row * 12 }
    for (let angle = -Math.PI; angle <= Math.PI; angle += .13) for (const radius of [0, 10, 60, 120, 1000]) {
      const result = solveSpiderLeg(hip, { x: hip.x + Math.cos(angle) * radius, y: hip.y + Math.sin(angle) * radius }, row, side, 12)
      near(Math.hypot(result.knee.x - hip.x, result.knee.y - hip.y, result.knee.z - 8), result.upper)
      near(Math.hypot(result.foot.x - result.knee.x, result.foot.y - result.knee.y, result.foot.z - result.knee.z), result.lower)
      assert.ok(Math.hypot(result.foot.x - hip.x, result.foot.y - hip.y, result.foot.z - 8) <= result.upper + result.lower - 3.999999)
      assert.ok(result.kneeHeight > 12, 'knee folded sideways or below the stance')
      assert.ok((result.foot.x - hip.x) * side > 0, 'toe crossed through the body during a pivot')
    }
  }
})

test('the walk cycle alternates opposite legs and keeps at least five supports planted', () => {
  for (let step = 0; step < 1000; step++) {
    const phase = step / 1000
    const swinging = spiderStepOffsets.map(offset => (phase + offset) % 1 < spiderSwing)
    assert.ok(swinging.filter(Boolean).length <= 3)
    for (let leg = 0; leg < 4; leg++) assert.ok(!(swinging[leg] && swinging[leg + 4]))
  }
})

test('legs crossing the lip retain fixed lengths in three dimensions', () => {
  const hip = { x: 8, y: 12, z: -16 }
  for (let row = 0; row < 4; row++) for (const scale of [.52, .78, 1]) {
    for (const target of [hip, { x: 35, y: -28, z: 16 }, { x: -800, y: 900, z: 400 }, { x: 12, y: 80, z: -16 }]) {
      const result = solveSpatialLeg(hip, target, { x: 28, y: -35, z: 20 }, row, scale)
      near(Math.hypot(result.knee.x - hip.x, result.knee.y - hip.y, result.knee.z - hip.z), result.upper)
      near(Math.hypot(result.foot.x - result.knee.x, result.foot.y - result.knee.y, result.foot.z - result.knee.z), result.lower)
    }
  }
})

test('a startled turn stays bounded and follows the shortest arc across the angle boundary', () => {
  let angle = Math.PI - .08
  const target = -Math.PI + .12
  for (let frame = 0; frame < 90; frame++) {
    const before = angle
    const error = Math.atan2(Math.sin(target - before), Math.cos(target - before))
    angle = turnTowards(angle, target, 1.65 / 60)
    assert.ok(Math.abs(angle - before) <= 1.65 / 60 + 1e-10)
    assert.ok(Math.abs(Math.atan2(Math.sin(target - angle), Math.cos(target - angle))) <= Math.abs(error) + 1e-10)
  }
  near(Math.atan2(Math.sin(target - angle), Math.cos(target - angle)), 0)
})

test('patrol alternates slow steps and scurries without a stop or a loop discontinuity', () => {
  const samples = Array.from({ length: 1201 }, (_, index) => spiderTempo(index * 10))
  assert.ok(Math.min(...samples) >= .79)
  assert.ok(Math.max(...samples) / Math.min(...samples) > 2.7)
  assert.ok(spiderPanicSpeed > Math.max(...samples) * 1.7)
  near(spiderTempo(0), spiderTempo(12000))
  assert.ok(Math.abs(spiderTempo(11999) - spiderTempo(1)) < .00001)
  assert.ok(spiderPanicExitRate >= spiderExitRate * 2)
})

test('climbing stays monotonic with continuous velocity through every handoff and the lip', () => {
  let previous = spiderClimb(0)
  for (let time = 1; time <= spiderClimbDuration; time++) {
    const position = spiderClimb(time)
    assert.ok(position >= previous - 1e-9)
    assert.ok(position >= -138 && position <= 74)
    previous = position
  }
  const epsilon = .05
  for (const time of [0, 320, 1320, 2760, spiderClimbDuration]) {
    const incoming = (spiderClimb(time) - spiderClimb(time - epsilon)) / epsilon
    const outgoing = (spiderClimb(time + epsilon) - spiderClimb(time)) / epsilon
    assert.ok(Math.abs(incoming - outgoing) < .0001, `velocity jumps at ${time}`)
  }
  near(spiderClimb(-10), -138)
  near(spiderClimb(spiderClimbDuration + 10), 74)
})

test('short phone calendars keep ordered patrol lanes and approach the bottom exit facing down', () => {
  for (const width of [280, 320, 390, 520]) for (const height of [150, 170, 190, 240]) {
    for (const gridHeight of [24, 38, 54]) {
      const gridTop = height - gridHeight - 30
      const patrol = spiderPatrolLayout(width, height, gridTop, gridTop + gridHeight)
      const points = patrol.points
      const approach = points.at(-2)!, exit = points.at(-1)!
      near(approach.x, exit.x)
      near(exit.y, height - spiderClimb(spiderClimbDuration))
      assert.ok(exit.y > approach.y, 'an upward approach would force a half-turn while folding over the bottom')
      assert.ok(points[1].y < points[2].y, 'fixed pixel insets must not reverse lanes when the year grid shrinks')
      assert.ok(patrol.scale >= .38 && patrol.scale <= .52)
      for (const point of points) {
        assert.ok(Number.isFinite(point.x) && Number.isFinite(point.y))
        assert.ok(point.x >= 0 && point.x <= width)
        assert.ok(point.y > 0 && point.y < height)
      }
    }
  }
})
