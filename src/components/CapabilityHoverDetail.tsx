import './CapabilityHoverDetail.css'

type Variant = 'web' | 'fullstack' | 'automation'

const signalPaths: Record<Variant, string> = {
  web: 'M12 18H66L78 6H139L151 18H228',
  fullstack: 'M12 8H82L94 20H146L158 8H228',
  automation: 'M12 15H74L86 5H132L144 15H184L196 25H228',
}

export default function CapabilityHoverDetail({ variant }: { variant: Variant }) {
  const route = signalPaths[variant]
  return (
    <span className={`capability-hover-detail capability-hover-detail--${variant}`} aria-hidden="true">
      <span className="capability-hover-lock" />
      <span className="capability-hover-ticks"><i /><i /><i /></span>
      <svg className="capability-hover-route" viewBox="0 0 240 30" preserveAspectRatio="none" fill="none">
        <path className="capability-hover-trace" d={route} pathLength="1" />
        <path className="capability-hover-packet" d={route} pathLength="1" />
        {variant === 'web' && <g className="capability-hover-components">
          <path d="M28 10V3h22v7m-16 0h10M168 10V2h6v8M182 18v7h24v-7" />
          <path className="capability-hover-ink" d="M88 10h18m4 0h8M188 22h12" />
          <circle cx="12" cy="18" r="2" /><circle cx="228" cy="18" r="2" />
        </g>}
        {variant === 'fullstack' && <g className="capability-hover-components">
          <path d="M20 15h51l10 11h30m18-22v7m5-7v7m5-7v7M164 16h27m5 0h26" />
          <path className="capability-hover-ink" d="M111 14h18v12h-18zM115 18h10v4h-10z" />
          <circle cx="12" cy="8" r="2" /><circle cx="228" cy="8" r="2" />
        </g>}
        {variant === 'automation' && <g className="capability-hover-components">
          <path d="M36 15V5h18m78 0v17h24m28-7V5h29" />
          <path className="capability-hover-ink" d="m96 15 5-4 5 4-5 4zM118 12v6m-3-3h6" />
          <circle cx="12" cy="15" r="2" /><circle cx="54" cy="5" r="2" />
          <circle cx="156" cy="22" r="2" /><circle cx="213" cy="5" r="2" />
        </g>}
      </svg>
    </span>
  )
}
