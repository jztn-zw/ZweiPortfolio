let started = false

// The first-paint shell lives outside React so it appears before the JS bundle.
// Progress counts real readiness tasks, never elapsed time or invented bytes.
export function finishStartup() {
  const screen = document.getElementById('startup-screen')
  if (!screen || started) return
  started = true
  // The alternate portrait and other nonessential media can finish in the background.
  const images = [...document.querySelectorAll<HTMLImageElement>('#root img:not([loading="lazy"], [data-startup-deferred])')]
  const progress = screen.querySelector<HTMLElement>('[data-startup-progress]')
  const status = screen.querySelector<HTMLElement>('[data-startup-status]')
  const tasks = [
    Promise.resolve(document.fonts?.ready),
    ...images.map(image => Promise.resolve().then(() => image.decode())),
  ]
  const total = tasks.length + 1 // The initial route has already committed.
  let completed = 1
  let unavailable = false
  const update = () => {
    progress?.style.setProperty('--boot-progress', String(completed / total))
    progress?.setAttribute('aria-valuenow', String(completed))
    progress?.setAttribute('aria-valuemax', String(total))
    progress?.setAttribute('aria-valuetext', `${completed} of ${total} essential resources processed`)
    if (status) status.textContent = completed < total ? 'PREPARING VISUALS' : unavailable ? 'READY · SOME IMAGES UNAVAILABLE' : 'READY TO EXPLORE'
  }
  update()
  const assets = tasks.map(task => task.catch(() => { unavailable = true }).finally(() => {
    completed++
    update()
  }))
  void Promise.all(assets).then(() => {
    // Let the committed page paint before lifting the loading curtain.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      document.getElementById('root')?.removeAttribute('inert')
      if (document.documentElement?.dataset?.view === 'minimal' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        screen.remove()
        return
      }
      screen.classList.add('is-leaving')
      const remove = () => {
        clearTimeout(removalTimeout)
        screen.removeEventListener('transitionend', onEnd)
        screen.remove()
      }
      const onEnd = (event: TransitionEvent) => {
        if (event.target === screen && event.propertyName === 'clip-path') remove()
      }
      const removalTimeout = setTimeout(remove, 600)
      screen.addEventListener('transitionend', onEnd)
    }))
  })
}
