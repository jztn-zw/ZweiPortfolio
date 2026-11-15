import { Component, lazy, Suspense } from 'react'
import type { ReactNode } from 'react'
import { finishStartup } from '../lib/startupScreen'
import './PageLoading.css'

const SiteHeader = lazy(() => import('./SiteHeader'))
function LoadingHeader() {
  return <Suspense fallback={null}><SiteHeader isHome={false} /></Suspense>
}

export default function PageLoading({ minimal = false }: { minimal?: boolean }) {
  if (minimal) return <main className="minimal-loading" aria-busy="true"><span>Jaztin</span><p role="status">Loading minimal portfolio…</p><a href="/experience">Full experience</a></main>
  return <><LoadingHeader /><main className="page-loading page-width" aria-busy="true"><span className="eyebrow" role="status">Loading page…</span><span className="page-loading-rule" aria-hidden="true" /></main></>
}

export class PageLoadBoundary extends Component<{ children: ReactNode; minimal?: boolean }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() { finishStartup() }
  render() {
    if (this.state.failed && this.props.minimal) return <main className="minimal-loading"><h1>Connection interrupted.</h1><p>The page couldn’t finish downloading.</p><button type="button" onClick={() => window.location.reload()}>Try again</button><a href="/experience">Full experience</a></main>
    return this.state.failed ? <><LoadingHeader /><main className="page-loading page-width"><h1>Connection interrupted.</h1><p>The page couldn’t finish downloading.</p><button className="page-back-button" onClick={() => window.location.reload()}>Try again</button><a className="page-back-button" href="/experience">Back to Home</a></main></> : this.props.children
  }
}
