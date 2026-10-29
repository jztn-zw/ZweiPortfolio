export const themeRevealDuration = 900

type Point = { x: number; y: number }

// Animate one registered length; static grid masks supply the pixel dissolve.
// Squares change in place as the circular boundary passes, with no flying fragments.
export function createThemeReveal(width: number, height: number, origin: Point): Keyframe[] {
  const radius = Math.hypot(Math.max(origin.x, width - origin.x), Math.max(origin.y, height - origin.y))
  return [
    { '--theme-reveal-radius': width <= 640 ? '-72px' : '-96px' },
    { '--theme-reveal-radius': `${Math.ceil(radius) + 6}px` },
  ]
}
