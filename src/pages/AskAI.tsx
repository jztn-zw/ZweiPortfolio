import { ArrowDown, ArrowLeft, ArrowUpRight } from 'lucide-react'
import SiteHeader from '../components/SiteHeader'
import Footer from '../components/Footer'
import GraphicMark from '../components/GraphicMark'
import AskChat from '../components/AskChat'
import './AskAI.css'

function SignalMark({ small = false }: { small?: boolean }) {
  return <svg className={`ask-signal${small ? ' ask-signal--small' : ''}`} viewBox="0 0 120 120" fill="none" aria-hidden="true">
    <circle cx="60" cy="60" r="43" className="ask-signal-orbit" stroke="currentColor" strokeWidth="1" strokeDasharray="52 15 14 24" />
    <circle cx="60" cy="60" r="32" stroke="currentColor" strokeWidth="1" opacity=".4" />
    <path d="M60 6v25m0 58v25M6 60h25m58 0h25M21 21h9m-9 0v9m78-9h-9m9 0v9M21 99h9m-9 0v-9m78 9h-9m9 0v-9" stroke="currentColor" />
    <path d="m60 39 21 21-21 21-21-21Z" className="ask-signal-core" stroke="currentColor" strokeWidth="1.5" />
    <path d="m60 51 9 9-9 9-9-9Z" fill="currentColor" />
    <circle cx="94" cy="34" r="3" fill="currentColor" />
  </svg>
}

export default function AskAI() {
  return <div className="ask-page">
    <a className="skip-link" href="#ai-content">Skip to conversation</a>
    <SiteHeader isHome={false} isAI />
    <main id="ai-content" className="ask-content page-width" tabIndex={-1}>
      <div className="ask-breadcrumb">
        <a className="page-back-button" href="/"><ArrowLeft size={15} aria-hidden="true" /> Back to Home</a>
        <span className="eyebrow">A CONVERSATION <span className="red">/</span> A CONNECTION</span>
      </div>

      <div className="ask-layout">
        <section className="ask-intro" aria-labelledby="ai-title">
          <p className="ask-kicker eyebrow"><span className="ask-kicker-index">03</span> ASK ME ANYTHING <GraphicMark variant="chevrons" /></p>
<h1 id="ai-title" tabIndex={-1}>CURIOSITY<br />STARTS<br /><span>HERE</span></h1>
          <p className="ask-intro-copy">The person. The projects. The process.<br />Get to know the mind behind the code.</p>

          <figure className="ask-poster" aria-label="Jaztin’s illustrated portrait">
            <div className="ask-poster-top"><span>JAC / PERSONAL EDITION</span><span>01—26</span></div>
            <span className="ask-poster-type" aria-hidden="true">JAZTIN</span>
            <SignalMark />
            <div className="ask-poster-slash" aria-hidden="true" />
            <img src="/images/jaztin-transition-character-v3.webp" width="1122" height="1402" alt="Illustrated Jaztin wearing glasses and a plaid cardigan" decoding="async" />
            <figcaption><span>ALWAYS CURIOUS.<br />ALWAYS BUILDING.</span><GraphicMark variant="registration" /></figcaption>
          </figure>
          <p className="ask-intro-footnote"><span aria-hidden="true">↳</span> Every good idea starts with a question.</p>
        </section>

        <AskChat />
      </div>

      <div className="ask-bottom-line"><span><ArrowDown size={12} aria-hidden="true" /> MORE THAN A CONVERSATION</span><a href="/#projects">Explore the work<ArrowUpRight size={13} aria-hidden="true" /></a><GraphicMark variant="chevrons" /></div>
    </main>
    <Footer topHref="/ask-ai" />
  </div>
}
