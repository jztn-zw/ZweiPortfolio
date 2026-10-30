import { memo } from 'react'
import type { CSSProperties } from 'react'

// Stable word keys let only newly arriving text animate; existing words stay put.
const AnswerText = memo(function AnswerText({ text, pending, animate }: { text: string; pending: boolean; animate: boolean }) {
  const paragraphs = text.split(/\n\s*\n/).filter(Boolean)
  return <>{paragraphs.map((paragraph, paragraphIndex) => <p className="ask-response-text" key={paragraphIndex}>
    {animate ? paragraph.split(/(\s+)/u).map((token, index) => /\S/u.test(token)
      ? <span className="ask-response-word" key={index} style={{ '--ask-word-delay': `${Math.min(index * 8, 144)}ms` } as CSSProperties}>{token}</span>
      : token) : paragraph}
    {pending && paragraphIndex === paragraphs.length - 1 && <span className="ask-response-cursor" aria-hidden="true" />}
  </p>)}</>
})

export default AnswerText
