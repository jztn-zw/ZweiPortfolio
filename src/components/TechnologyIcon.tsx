import { technologyIconIds } from '../data/skills'
import './TechnologyIcon.css'

export default function TechnologyIcon({ technology }: { technology: string }) {
  const iconId = technologyIconIds[technology]
  if (!iconId) return null

  return (
    <svg className="technology-icon" width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <use href={`/tech-icons.svg#${iconId}`} />
    </svg>
  )
}
