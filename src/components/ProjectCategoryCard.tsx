import { memo } from 'react'
import { ArrowUpRight, Layers3, PanelsTopLeft, Workflow } from 'lucide-react'
import type { Collection } from '../data/projectCollections'
import { projectCollectionHref } from '../lib/routes'

const icons = { 'web-mobile': PanelsTopLeft, automation: Workflow, tools: Layers3 }

const CollectionArtwork = memo(function CollectionArtwork({ id }: { id: Collection['id'] }) {
  return (
    <svg className="collection-art" viewBox="0 0 250 150" fill="none" aria-hidden="true" focusable="false">
      <g className="collection-guides">
        <path d="M12 25V15h10m206 0h10v10M12 125v10h10m206 0h10v-10M25 124h200M125 14v122" />
        <circle cx="125" cy="75" r="58" />
        <path d="M20 75h210M39 116l172-83" strokeDasharray="2 5" />
      </g>
      {id === 'web-mobile' && <g className="collection-art-main">
        <g transform="rotate(-7 99 69)">
          <rect className="collection-art-surface" x="26" y="26" width="145" height="91" rx="4" />
          <path d="M26 42h145" /><circle cx="35" cy="34" r="1" /><circle cx="42" cy="34" r="1" /><circle cx="49" cy="34" r="1" />
          <path className="collection-art-muted" d="M38 54h120v29H38zM38 91h35v14H38zm43 0h35v14H81zm43 0h34v14h-34z" />
          <path d="M46 62h35m-35 6h26m-26 6h16" />
          <path className="collection-art-accent" d="m125 62-6 6 6 6m10-12 6 6-6 6m-3-15-5 18" />
        </g>
        <g className="collection-art-detail">
          <g transform="rotate(8 181 88)">
            <rect className="collection-art-surface" x="157" y="49" width="46" height="82" rx="7" />
            <rect className="collection-art-muted" x="163" y="63" width="34" height="26" rx="2" />
            <path d="M174 56h12m-22 41h29m-29 6h22m-13 19h14" />
            <path className="collection-art-accent" d="m169 81 7-7 5 4 10-8" />
          </g>
        </g>
      </g>}
      {id === 'automation' && <g className="collection-art-main">
        <path className="collection-art-muted" d="M65 72h28m67 0h17V39h13m-13 33v39h13M127 100v23H84" />
        <path className="collection-art-accent" d="M67 72h23m74 0h13V39h10m-10 44v28h10" strokeDasharray="3 5" />
        <rect className="collection-art-surface" x="21" y="53" width="46" height="38" rx="4" />
        <path className="collection-art-accent" d="m46 61-10 13h9l-3 9 12-14h-9z" />
        <path className="collection-art-surface" d="m127 46 33 18v27l-33 18-33-18V64z" />
        <path d="m94 64 33 18 33-18m-33 18v27m-18-36 33-18" />
        <path className="collection-art-accent" d="m117 64 10-6 11 6-11 6z" />
        <g className="collection-art-detail">
          <rect className="collection-art-surface" x="189" y="24" width="40" height="30" rx="4" />
          <rect className="collection-art-surface" x="189" y="96" width="40" height="30" rx="4" />
          <path className="collection-art-accent" d="m202 39 5 5 10-10m-17 77 5 5 10-10" />
        </g>
        <circle cx="177" cy="72" r="3" className="collection-art-surface" />
        <circle cx="84" cy="123" r="3" className="collection-art-surface" />
      </g>}
      {id === 'tools' && <g className="collection-art-main">
        <path className="collection-art-surface" d="m125 72 83 29v10l-83 29-83-29v-10z" />
        <path d="m42 101 83 29 83-29m-83 29v10" />
        <path className="collection-art-surface" d="m125 50 83 29v10l-83 29-83-29V79z" />
        <path d="m42 79 83 29 83-29m-83 29v10" />
        <g className="collection-art-detail">
          <path className="collection-art-surface" d="m125 25 83 29v12l-83 29-83-29V54z" />
          <path d="m42 54 83 29 83-29m-83 29v12" />
          <path className="collection-art-muted" d="m125 35 54 19-54 19-54-19z" />
          <path className="collection-art-accent" d="m114 49-9 5 9 5m22-10 9 5-9 5m-8-13-6 16" />
        </g>
        <path className="collection-art-accent" d="M53 104l14 5m-14-27 14 5" />
      </g>}
    </svg>
  )
})

type Props = {
  collection: Collection
  ribbonIndex: number
  isClone: boolean
  isCentered: boolean
}

export default memo(function ProjectCategoryCard({ collection, ribbonIndex, isClone, isCentered }: Props) {
  const Icon = icons[collection.id]
  const titleId = `collection-title-${ribbonIndex}`

  return (
    <article className={`project-category-card project-category-card--${collection.id}${isClone ? ' project-tile--clone' : ''}${isCentered ? ' is-centered' : ''}`}
      aria-labelledby={titleId} aria-hidden={isClone || undefined} data-ribbon-index={ribbonIndex}>
      <div className="collection-card-meta eyebrow">
        <span><b>{collection.index}</b> / COLLECTION</span>
        <span className="collection-card-icon" aria-hidden="true"><Icon size={16} strokeWidth={1.5} /></span>
      </div>
      <h3 id={titleId}>{collection.title}</h3>
      <div className="collection-art-frame">
        <CollectionArtwork id={collection.id} />
      </div>
      <p className="collection-description">{collection.description}</p>
      <div className="collection-topics" aria-hidden="true">{collection.topics.map(topic => <span key={topic}>{topic}</span>)}</div>
      <div className="collection-card-footer">
        <a href={projectCollectionHref(collection.id)} data-ribbon-link="" draggable={false}
          tabIndex={isClone ? -1 : undefined} aria-label={`Explore ${collection.title} projects`}>
          Explore collection <ArrowUpRight size={15} aria-hidden="true" />
        </a>
      </div>
    </article>
  )
})
