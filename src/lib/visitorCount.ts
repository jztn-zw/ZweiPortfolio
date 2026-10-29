let pendingCount: Promise<number> | undefined

export function getVisitorCount() {
  // Share one request across routes, footer mounts, and React's effect replay.
  pendingCount ??= fetch('/api/visitors', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
    signal: AbortSignal.timeout(8000),
  }).then(async response => {
    if (!response.ok) throw new Error('Visitor count unavailable')
    const data: { count?: unknown } = await response.json()
    if (typeof data.count !== 'number' || !Number.isSafeInteger(data.count) || data.count < 0) {
      throw new Error('Invalid visitor count')
    }
    return data.count
  })
  return pendingCount
}
