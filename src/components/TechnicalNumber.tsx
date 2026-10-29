import { useId } from 'react'
import './TechnicalNumber.css'

// Transparent stencil cuts preserve the artwork behind each live metric value.
export default function TechnicalNumber({ value }: { value: string }) {
  const id = useId().replace(/:/g, '')
  return (
    <span className="technical-number" aria-hidden="true">
      {[...value].map((character, index) => {
        const mask = `${id}-digit-${index}`
        const isDigit = /^\d$/.test(character)
        const cutHeight = '235'.includes(character) ? 48 : '467'.includes(character) ? 67 : 85
        return (
          <svg key={index} className={`technical-number-glyph${character === '.' || character === ',' ? ' technical-number-glyph--punctuation' : ''}`} viewBox="0 9 64 96" preserveAspectRatio="none" focusable="false">
            {isDigit && <defs>
              <mask id={mask} x="0" y="0" width="64" height="112" maskUnits="userSpaceOnUse">
                <rect width="64" height="112" fill="white" />
                <path d={`M40 ${cutHeight - 8} 63 ${cutHeight + 9}`} stroke="black" strokeWidth="3.2" />
                <path d="m0 78 26 26H0Z" fill="black" />
                {character === '1' && <path d="m25 86 36 24" stroke="black" strokeWidth="3.5" />}
              </mask>
            </defs>}
            <text x="2" y="101" textLength="58" lengthAdjust="spacingAndGlyphs" mask={isDigit ? `url(#${mask})` : undefined}>{character}</text>
          </svg>
        )
      })}
    </span>
  )
}
