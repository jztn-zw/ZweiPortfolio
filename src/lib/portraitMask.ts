type Tile = { x: number; y: number; delay: number }

// Disjoint cells with the same opacity clock can share a path. Their locations,
// edges and fade timing stay identical, with fewer SVG nodes and style updates.
export function groupMaskTiles(tiles: readonly Tile[], size: number) {
  const groups = new Map<number, string>()
  for (const { x, y, delay } of tiles) {
    groups.set(delay, (groups.get(delay) ?? '') + `M${x} ${y}h${size}v${size}h-${size}z`)
  }
  return [...groups].map(([delay, path]) => ({ delay, path }))
}
