import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowUp, ArrowUpRight, ChevronRight, CornerDownLeft, RotateCcw, Square } from 'lucide-react'
import SiteHeader from '../components/SiteHeader'
import Footer from '../components/Footer'
import NavbarGlyph from '../components/NavbarGlyph'
import GraphicMark from '../components/GraphicMark'
import AnswerText from '../components/AnswerText'
import { askAiHistoryLimit, askAiQuestionLimit, askAiTopics, getPortfolioAnswer } from '../lib/askAi'
import { chatErrorMessage, chatMessages, ChatRequestError, getChatStatus, readChatHistory, saveChatHistory, streamChat } from '../lib/chatClient'
import type { ChatExchange } from '../lib/chatClient'
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
  const [exchanges, setExchanges] = useState(readChatHistory)
  const [draft, setDraft] = useState('')
  const [available, setAvailable] = useState<boolean | null>(null)
  const [animatedAnswerId, setAnimatedAnswerId] = useState<string | null>(null)
  const feedRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const firstScroll = useRef(true)
  const followScroll = useRef(true)
  const activeRequest = useRef<AbortController | null>(null)
  const updateFrame = useRef(0)
  const mounted = useRef(true)
  const busy = exchanges.some(exchange => exchange.status === 'pending')
  const hasConversation = exchanges.length > 0

  useEffect(() => {
    mounted.current = true
    const statusRequest = new AbortController()
    void getChatStatus(statusRequest.signal).then(value => { if (!statusRequest.signal.aborted) setAvailable(value) }).catch(() => { if (!statusRequest.signal.aborted) setAvailable(false) })
    return () => { mounted.current = false; statusRequest.abort(); activeRequest.current?.abort(); cancelAnimationFrame(updateFrame.current) }
  }, [])
  useEffect(() => { if (!busy) saveChatHistory(exchanges) }, [exchanges, busy])
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const feed = feedRef.current
      const instant = firstScroll.current || busy || window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (followScroll.current) feed?.scrollTo({ top: feed.scrollHeight, behavior: instant ? 'instant' : 'smooth' })
      firstScroll.current = false
    })
    return () => cancelAnimationFrame(frame)
  }, [exchanges, busy])

  const send = async (value: string, retryId?: string) => {
    const question = value.trim().slice(0, askAiQuestionLimit)
    if (!question || activeRequest.current) return
    const controller = new AbortController()
    activeRequest.current = controller
    followScroll.current = true
    const id = retryId || crypto.randomUUID()
    setAnimatedAnswerId(id)
    const history = exchanges.filter(exchange => exchange.id !== retryId)
    const next: ChatExchange = { id, question, answer: '', provider: null, status: 'pending' }
    setExchanges([...history, next].slice(-askAiHistoryLimit))
    setDraft('')
    if (window.matchMedia('(pointer: fine)').matches) inputRef.current?.focus({ preventScroll: true })
    let answer = '', provider: ChatExchange['provider'] = null
    const update = (status: ChatExchange['status'], code?: string) => {
      if (mounted.current) setExchanges(current => current.map(exchange => exchange.id === id ? { ...exchange, answer, provider, status, code } : exchange))
    }
    try {
      await streamChat(chatMessages(history, question), event => {
        if (event.type === 'provider') provider = event.provider
        if (event.type === 'delta') answer = (answer + event.text).slice(0, 4000)
        if (!updateFrame.current) updateFrame.current = requestAnimationFrame(() => { updateFrame.current = 0; update('pending') })
      }, controller.signal)
      if (mounted.current && provider !== 'portfolio') setAvailable(true)
      update('complete')
    } catch (error) {
      update(controller.signal.aborted ? 'stopped' : 'error', error instanceof ChatRequestError ? error.code : 'unavailable')
    } finally {
      cancelAnimationFrame(updateFrame.current)
      updateFrame.current = 0
      if (activeRequest.current === controller) activeRequest.current = null
    }
  }

  const showNote = (id: string, question: string) => {
    setAnimatedAnswerId(id)
    const answer = getPortfolioAnswer(question).paragraphs.join('\n\n')
    setExchanges(current => current.map(exchange => exchange.id === id ? { ...exchange, answer, provider: 'portfolio', status: 'complete', code: undefined } : exchange))
  }

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
          <h1 id="ai-title" tabIndex={-1}>CURIOSITY<br />STARTS<br /><span>HERE<span className="ask-period">.</span></span></h1>
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

        <section className="ask-console" aria-label="Ask me anything about Jaztin’s portfolio">
          <header className="ask-console-header">
            <div className="ask-console-name"><span className="ask-console-emblem"><NavbarGlyph name="ai" /></span><div><strong>JAZTIN’S FIELD NOTES</strong><span>LET’S TALK ABOUT MY WORK</span></div></div>
            <span className="ask-preview-badge"><i /> {busy ? 'RESPONDING' : available === null ? 'CONNECTING' : available ? 'ASK ME ANYTHING' : 'PORTFOLIO GUIDE'}</span>
          </header>

          <div className="ask-feed" ref={feedRef} role="log" aria-label="Conversation" aria-live={busy ? 'off' : 'polite'} aria-relevant="additions text" tabIndex={0} onScroll={event => { const feed = event.currentTarget; followScroll.current = feed.scrollHeight - feed.scrollTop - feed.clientHeight < 100 }}>
            {!hasConversation ? <div className="ask-welcome">
              <div className="ask-welcome-label"><span className="eyebrow">LET’S START WITH YOU</span><GraphicMark variant="modules" /></div>
              <h2>WHAT ARE YOU<br />CURIOUS ABOUT<span>?</span></h2>
              <p>Pick a starting point, or ask your own question.</p>
              <div className="ask-topics">
                {askAiTopics.map((topic, index) => <button type="button" className="ask-topic" key={topic.id} onClick={() => { void send(topic.question) }}>
                  <span className="ask-topic-index">0{index + 1}</span>
                  <span className="ask-topic-copy"><strong>{topic.label}</strong><span>{topic.detail}</span></span>
                  <span className="ask-topic-arrow"><ArrowUpRight size={18} strokeWidth={1.5} /></span>
                </button>)}
              </div>
            </div> : <div className="ask-exchanges">
              {exchanges.map(exchange => {
                const { question } = exchange
                const answer = getPortfolioAnswer(question)
                const fresh = animatedAnswerId === exchange.id
                const pending = exchange.status === 'pending'
                return <div className={`ask-exchange${fresh ? ' ask-exchange--new' : ''}`} key={exchange.id}>
                  <article className="ask-message ask-message--you" aria-label="Your question"><span className="ask-message-sender">YOU <span>↙</span></span><p>{question}</p></article>
                  <article className={`ask-message ask-message--guide${pending ? ' is-answering' : ''}${fresh ? ' is-fresh' : ''}`} aria-label={exchange.provider === 'portfolio' ? 'Saved portfolio reply from Jaztin' : 'Automated reply in Jaztin’s voice'} aria-busy={pending}>
                    <span className="ask-message-sender"><span className="ask-message-mark"><NavbarGlyph name="ai" /></span> JAZTIN {exchange.provider === 'portfolio' && <span className="ask-message-topic">Portfolio note</span>}</span>
                    <AnswerText key={`${exchange.id}-${exchange.provider}`} text={exchange.answer} pending={pending} animate={fresh} />
                    {pending && !exchange.answer && <span className="ask-thinking" role="status"><i /><i /><i /><span>One moment</span></span>}
                    {exchange.status === 'complete' && <span className="ask-reply-finish" aria-hidden="true"><i /></span>}
                    {(exchange.status === 'error' || exchange.status === 'stopped') && <div className="ask-chat-error" role="status"><p>{exchange.status === 'stopped' ? 'Answer stopped.' : chatErrorMessage(exchange.code)}</p><div><button type="button" disabled={busy} onClick={() => { void send(question, exchange.id) }}><RotateCcw size={12} aria-hidden="true" />Retry</button><button type="button" disabled={busy} onClick={() => showNote(exchange.id, question)}>Read portfolio note<ChevronRight size={12} aria-hidden="true" /></button></div></div>}
                    {exchange.status === 'complete' && answer.links.length > 0 && <div className="ask-answer-links">{answer.links.map(link => <a href={link.href} key={link.href} {...(link.href.startsWith('https://') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{link.label}<ArrowUpRight size={13} aria-hidden="true" /></a>)}</div>}
                  </article>
                </div>
              })}
            </div>}
          </div>

          {hasConversation && <div className="ask-followups" aria-label="Explore another topic">{askAiTopics.map(topic => <button type="button" key={topic.id} disabled={busy} onClick={() => { void send(topic.question) }}>{topic.label}<ChevronRight size={11} aria-hidden="true" /></button>)}</div>}

          <form className="ask-composer" onSubmit={event => { event.preventDefault(); void send(draft) }}>
            <label htmlFor="ask-question" className="sr-only">Your question about Jaztin</label>
            <div className="ask-input-frame">
              <span className="ask-input-prompt" aria-hidden="true">↳</span>
              <textarea id="ask-question" ref={inputRef} value={draft} maxLength={askAiQuestionLimit} rows={2} placeholder="Ask me about my work…" onChange={event => setDraft(event.target.value)} onKeyDown={event => {
                if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); void send(draft) }
              }} />
              {busy ? <button type="button" className="ask-send ask-stop" aria-label="Stop answer" onClick={() => activeRequest.current?.abort()}><Square size={12} fill="currentColor" aria-hidden="true" /></button> : <button type="submit" className="ask-send" disabled={!draft.trim()} aria-label="Send question"><ArrowUp size={19} aria-hidden="true" /></button>}
            </div>
            <div className="ask-composer-tools"><span><CornerDownLeft size={11} aria-hidden="true" /> <span>ENTER TO SEND <i>/</i> SHIFT + ENTER FOR A NEW LINE</span></span><span>{draft.length}<i>/</i>{askAiQuestionLimit}</span></div>
          </form>

          <footer className="ask-console-footer"><button type="button" className="ask-reset" disabled={!hasConversation || busy} onClick={() => { setExchanges([]); setDraft('') }}><RotateCcw size={12} aria-hidden="true" /><span>New chat</span></button></footer>
        </section>
      </div>

      <div className="ask-bottom-line"><span><ArrowDown size={12} aria-hidden="true" /> MORE THAN A CONVERSATION</span><a href="/#projects">Explore the work<ArrowUpRight size={13} aria-hidden="true" /></a><GraphicMark variant="chevrons" /></div>
    </main>
    <Footer topHref="/ask-ai" />
  </div>
}
