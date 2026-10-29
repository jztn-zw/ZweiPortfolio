import { Component } from 'react'
import type { ReactNode } from 'react'
import SiteHeader from './SiteHeader'
import './PageLoading.css'

export default function PageLoading() {
  return <><SiteHeader isHome={false} /><main className="page-loading page-width" aria-busy="true"><span className="eyebrow" role="status">Loading page…</span><span className="page-loading-rule" aria-hidden="true" /></main></>
}

export class PageLoadBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    return this.state.failed ? <><SiteHeader isHome={false} /><main className="page-loading page-width"><h1>Connection interrupted.</h1><p>The page couldn’t finish downloading.</p><button className="page-back-button" onClick={() => window.location.reload()}>Try again</button><a className="page-back-button" href="/">Back to Home</a></main></> : this.props.children
  }
}
