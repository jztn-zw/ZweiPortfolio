// Coalesce bursts of layout events without changing the animation or its timing.
export function advanceFrameDeadline(now: number, deadline: number, interval: number) {
  if (!interval) return 0
  return deadline ? deadline + (Math.floor(Math.max(0, now - deadline) / interval) + 1) * interval : now + interval
}

export function createFrameTask(task: () => void) {
  let frame: number | undefined
  return {
    schedule() {
      if (frame !== undefined) return
      frame = requestAnimationFrame(() => { frame = undefined; task() })
    },
    cancel() {
      if (frame !== undefined) cancelAnimationFrame(frame)
      frame = undefined
    },
  }
}
