export type DeviceHints = { cores?: number; memory?: number; saveData?: boolean; coarsePointer?: boolean; width?: number; reducedMotion?: boolean }

export function chooseEffectsMode(hints: DeviceHints): 'lite' | 'full' {
  const limitedHardware = (hints.cores ?? 8) <= 4 || (hints.memory ?? 8) <= 4
  const compactTouchScreen = hints.coarsePointer && (hints.width ?? 1280) <= 900
  return hints.reducedMotion || hints.saveData || limitedHardware || compactTouchScreen ? 'lite' : 'full'
}

// A scheduling hint only. Hardware detection never removes artwork or interactions.
export function initializeEffectsMode() {
  const device = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } }
  document.documentElement.dataset.effects = chooseEffectsMode({
    cores: device.hardwareConcurrency, memory: device.deviceMemory,
    saveData: device.connection?.saveData, width: window.innerWidth,
    coarsePointer: window.matchMedia('(pointer: coarse)').matches,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  })
}
