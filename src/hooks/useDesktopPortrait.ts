import { useSyncExternalStore } from 'react'

const query = '(min-width: 901px)'
const subscribe = (notify: () => void) => {
  const media = window.matchMedia(query)
  media.addEventListener('change', notify)
  return () => media.removeEventListener('change', notify)
}

// The mobile layout hides this entire effect; avoid its masks and photo request.
export default function useDesktopPortrait() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false)
}
