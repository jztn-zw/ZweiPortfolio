import { ArrowRight, MessageCircle, X } from 'lucide-react'
import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import './MinimalChatOverlay.css'

const AskChat = lazy(() => import('./AskChat').catch(() => ({
  default: () => <p className="min-chat-status" role="status">The chat couldn’t load. <a href="/ask-ai">Open the chat page</a></p>,
})))

export default function MinimalChatOverlay() {
  const trigger = useRef<HTMLButtonElement>(null)
  const conversation = useRef<HTMLElement>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const triggerElement = trigger.current
    const background = triggerElement?.closest<HTMLElement>('.min-shell')
    const previouslyInert = background?.inert ?? false
    if (background) background.inert = true
    conversation.current?.focus({ preventScroll: true })
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); setOpen(false) }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      if (background) background.inert = previouslyInert
      if (triggerElement?.isConnected) triggerElement.focus({ preventScroll: true })
    }
  }, [open])

  return <>
    <button className="resume-chat-trigger" ref={trigger} type="button" aria-expanded={open} aria-controls="min-chat-conversation" onClick={() => setOpen(true)}><MessageCircle size={15} aria-hidden="true" /><span>Ask me anything</span><ArrowRight size={14} aria-hidden="true" /></button>
    {open && createPortal(<div className="minimal-view min-chat-overlay">
      <button className="min-chat-backdrop" type="button" tabIndex={-1} aria-label="Close chat" onClick={() => setOpen(false)} />
      <section id="min-chat-conversation" className="min-chat-conversation" ref={conversation} tabIndex={-1} aria-label="Ask me anything">
        <button className="min-chat-close" type="button" aria-label="Close chat" onClick={() => setOpen(false)}><X size={17} aria-hidden="true" /></button>
        <Suspense fallback={<p className="min-chat-status" role="status">Opening chat…</p>}><AskChat compact /></Suspense>
      </section>
    </div>, document.body)}
  </>
}
