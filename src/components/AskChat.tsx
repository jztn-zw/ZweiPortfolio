import { useEffect, useRef, useState } from 'react'
import { ArrowUp, ArrowUpRight, ChevronRight, CornerDownLeft, RotateCcw, Square } from 'lucide-react'
import NavbarGlyph from './NavbarGlyph'
import GraphicMark from './GraphicMark'
import AnswerText from './AnswerText'
import TerminalAnswerText from './TerminalAnswerText'
import { askAiHistoryLimit, askAiQuestionLimit, askAiTopics, getPortfolioAnswer } from '../lib/askAi'
import { chatErrorMessage, chatMessages, ChatRequestError, getChatStatus, readChatHistory, saveChatHistory, streamChat } from '../lib/chatClient'
import type { ChatExchange } from '../lib/chatClient'
import './AskChat.css'

export default function AskChat({ compact = false }: { compact?: boolean }) {
  const [exchanges, setExchanges] = useState<ChatExchange[]>(() => compact ? [] : readChatHistory())
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
    if (!compact) void getChatStatus(statusRequest.signal).then(value => { if (!statusRequest.signal.aborted) setAvailable(value) }).catch(() => { if (!statusRequest.signal.aborted) setAvailable(false) })
    return () => { mounted.current = false; statusRequest.abort(); activeRequest.current?.abort(); cancelAnimationFrame(updateFrame.current) }
  }, [compact])
  useEffect(() => {
    if (compact && window.matchMedia('(pointer: fine)').matches) inputRef.current?.focus({ preventScroll: true })
  }, [compact])
  useEffect(() => { if (!compact && !busy) saveChatHistory(exchanges) }, [exchanges, busy, compact])
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
    setExchanges(compact ? [next] : [...history, next].slice(-askAiHistoryLimit))
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
      if (!compact && mounted.current && provider !== 'portfolio') setAvailable(true)
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

  return <section className="ask-console" aria-label="Ask me anything about Jaztin’s portfolio">
    {!compact && <header className="ask-console-header">
      <div className="ask-console-name"><span className="ask-console-emblem"><NavbarGlyph name="ai" /></span><div><strong>JAZTIN’S FIELD NOTES</strong><span>LET’S TALK ABOUT MY WORK</span></div></div>
      <span className="ask-preview-badge"><i /> {busy ? 'RESPONDING' : available === null ? 'CONNECTING' : available ? 'ASK ME ANYTHING' : 'PORTFOLIO GUIDE'}</span>
    </header>}

    <div className="ask-feed" ref={feedRef} role={compact ? 'status' : 'log'} aria-label={compact ? 'Latest answer' : 'Conversation'} aria-live={busy ? 'off' : 'polite'} aria-relevant="additions text" tabIndex={0} onScroll={event => { const feed = event.currentTarget; followScroll.current = feed.scrollHeight - feed.scrollTop - feed.clientHeight < 100 }}>
      {!hasConversation ? !compact && <div className="ask-welcome">
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
            {!compact && <article className="ask-message ask-message--you" aria-label="Your question"><span className="ask-message-sender">YOU <span>↙</span></span><p>{question}</p></article>}
            <article className={`ask-message ask-message--guide${pending ? ' is-answering' : ''}${fresh ? ' is-fresh' : ''}`} aria-label={exchange.provider === 'portfolio' ? 'Saved portfolio reply from Jaztin' : 'Automated reply in Jaztin’s voice'} aria-busy={pending}>
              {!compact && <span className="ask-message-sender"><span className="ask-message-mark"><NavbarGlyph name="ai" /></span> JAZTIN {exchange.provider === 'portfolio' && <span className="ask-message-topic">Portfolio note</span>}</span>}
              {compact
                ? <TerminalAnswerText key={`${exchange.id}-${exchange.provider}`} text={exchange.answer} pending={pending} onProgress={() => {
                  const feed = feedRef.current
                  if (feed && followScroll.current) feed.scrollTop = feed.scrollHeight
                }} />
                : <AnswerText key={`${exchange.id}-${exchange.provider}`} text={exchange.answer} pending={pending} animate={fresh} />}
              {pending && !exchange.answer && <span className="ask-thinking" role="status">{compact ? 'One moment…' : <><i /><i /><i /><span>One moment</span></>}</span>}
              {!compact && exchange.status === 'complete' && <span className="ask-reply-finish" aria-hidden="true"><i /></span>}
              {(exchange.status === 'error' || exchange.status === 'stopped') && <div className="ask-chat-error" role="status"><p>{exchange.status === 'stopped' ? 'Answer stopped.' : chatErrorMessage(exchange.code)}</p><div><button type="button" disabled={busy} onClick={() => { void send(question, exchange.id) }}>{!compact && <RotateCcw size={12} aria-hidden="true" />}Retry</button><button type="button" disabled={busy} onClick={() => showNote(exchange.id, question)}>Read portfolio note{!compact && <ChevronRight size={12} aria-hidden="true" />}</button></div></div>}
              {exchange.status === 'complete' && answer.links.length > 0 && <div className="ask-answer-links">{answer.links.map(link => <a href={link.href} key={link.href} {...(link.href.startsWith('https://') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{link.label}{!compact && <ArrowUpRight size={13} aria-hidden="true" />}</a>)}</div>}
            </article>
          </div>
        })}
      </div>}
    </div>

    {!compact && hasConversation && <div className="ask-followups" aria-label="Explore another topic">{askAiTopics.map(topic => <button type="button" key={topic.id} disabled={busy} onClick={() => { void send(topic.question) }}>{topic.label}<ChevronRight size={11} aria-hidden="true" /></button>)}</div>}

    <form className="ask-composer" onSubmit={event => { event.preventDefault(); void send(draft) }}>
      <label htmlFor="ask-question" className="sr-only">Your question about Jaztin</label>
      <div className="ask-input-frame">
        {!compact && <span className="ask-input-prompt" aria-hidden="true">↳</span>}
        <textarea id="ask-question" ref={inputRef} value={draft} maxLength={askAiQuestionLimit} rows={compact ? 1 : 2} placeholder={compact ? 'Type a question…' : 'Ask me about my work…'} onChange={event => setDraft(event.target.value)} onKeyDown={event => {
          if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); void send(draft) }
        }} />
        {busy ? <button type="button" className="ask-send ask-stop" aria-label="Stop answer" onClick={() => activeRequest.current?.abort()}>{compact ? '[stop]' : <Square size={12} fill="currentColor" aria-hidden="true" />}</button> : <button type="submit" className={compact ? 'sr-only' : 'ask-send'} disabled={!draft.trim()} aria-label="Send question">{compact ? 'Send' : <ArrowUp size={19} aria-hidden="true" />}</button>}
      </div>
      {!compact && <div className="ask-composer-tools"><span><CornerDownLeft size={11} aria-hidden="true" /> <span>ENTER TO SEND <i>/</i> SHIFT + ENTER FOR A NEW LINE</span></span><span>{draft.length}<i>/</i>{askAiQuestionLimit}</span></div>}
    </form>

    {!compact && <footer className="ask-console-footer"><button type="button" className="ask-reset" disabled={!hasConversation || busy} onClick={() => { setExchanges([]); setDraft('') }}><RotateCcw size={12} aria-hidden="true" /><span>New chat</span></button></footer>}
  </section>
}
