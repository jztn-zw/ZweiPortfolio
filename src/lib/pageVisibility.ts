// Pause render work behind route/theme overlays and in hidden tabs, then resume
// from the same pose. No artwork, effects, or animation timings are substituted.
export function observePageCover(onChange: (covered: boolean) => void) {
  if (typeof MutationObserver !== 'function') { onChange(false); return () => {} }
  let previous: boolean | undefined
  let disposed = false
  const update = () => {
    if (disposed) return
    const root = document.documentElement
    const covered = document.hidden || Boolean(root.dataset.pageTransition || root.dataset.themeTransition)
    if (covered === previous) return
    previous = covered
    onChange(covered)
  }
  const observer = new MutationObserver(update)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-page-transition', 'data-theme-transition'] })
  document.addEventListener('visibilitychange', update)
  update()
  return () => {
    disposed = true
    observer.disconnect()
    document.removeEventListener('visibilitychange', update)
  }
}
