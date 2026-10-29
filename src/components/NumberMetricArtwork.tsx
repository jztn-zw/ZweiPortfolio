import { useId } from 'react'
import './NumberMetricArtwork.css'

export default function NumberMetricArtwork({ index }: { index: number }) {
  const id = useId().replace(/:/g, '')
  const face = `${id}-metric-face`
  return (
    <svg className={`numbers-metric-art numbers-metric-art--${index}`} viewBox="0 0 280 250" fill="none" aria-hidden="true" focusable="false">
      <defs><linearGradient id={face} x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox"><stop stopColor="var(--metric-face-top)" /><stop offset="1" stopColor="var(--metric-face-bottom)" /></linearGradient></defs>
      <g className="metric-art-registration"><path d="M27 52V39h13m200 0h13v13M27 212v13h13m200 0h13v-13M15 132h14m224 0h14M140 18v14m0 192v14" /><path d="M24 192h232M140 35v186" strokeDasharray="2 6" /></g>

      {index === 0 && <>
        <ellipse className="metric-art-floor" cx="146" cy="207" rx="89" ry="18" />
        <g className="metric-art-part metric-project-base"><path className="metric-art-face" d="m51 161 92-43 92 43v12l-92 43-92-43Z" /><path d="m51 161 92 43 92-43m-92 43v12" /></g>
        <g className="metric-art-part metric-project-middle"><path className="metric-art-face" d="m51 133 92-43 92 43v12l-92 43-92-43Z" /><path d="m51 133 92 43 92-43m-92 43v12" /><path className="metric-art-accent" d="m67 151 23 11m7 3 8 4" /></g>
        <g className="metric-art-part metric-project-front">
          <path fill={`url(#${face})`} d="m51 105 92-43 92 43v12l-92 43-92-43Z" />
          <path d="m51 105 92-43 92 43v12l-92 43-92-43v-12Zm0 0 92 43 92-43m-92 43v12" />
          <path className="metric-art-soft" d="m68 106 74-35 76 35-75 35-75-35Z" />
          <path className="metric-art-accent" d="m122 105 14 7 28-20" strokeWidth="2" />
          <path d="m170 126 28-13m-18 22 30-14" opacity=".5" />
        </g>
        <g className="metric-art-part metric-project-badge"><path className="metric-art-badge" d="m220 61 14 8v16l-14 8-14-8V69l14-8Z" /><path className="metric-art-accent" d="m213 77 5 5 9-11" strokeWidth="1.5" /><path className="metric-art-soft" d="M220 93v22l-13 6" strokeDasharray="2 4" /></g>
      </>}

      {index === 1 && <>
        <ellipse className="metric-art-floor" cx="144" cy="210" rx="91" ry="14" />
        <g className="metric-art-tech-orbit"><ellipse cx="144" cy="126" rx="99" ry="62" transform="rotate(-30 144 126)" /><ellipse className="metric-art-soft" cx="144" cy="126" rx="99" ry="62" transform="rotate(30 144 126)" /><circle className="metric-art-accent" cx="228" cy="72" r="3" /></g>
        <path className="metric-art-soft" d="M78 69h42v35m92 82h-44v-40M67 170h40m73-90h36" strokeDasharray="3 5" />
        <g className="metric-art-part metric-tech-core">
          <path className="metric-art-face" d="m95 116 49-28 49 28v38l-49 28-49-28Z" /><path d="m95 116 49 28 49-28m-49 28v38" />
          <path fill={`url(#${face})`} d="m105 115 39-22 39 22-39 23-39-23Z" stroke="currentColor" />
          <path className="metric-art-accent" d="m129 111-8 5 8 5m29-10 8 5-8 5m-10-12-7 14" strokeWidth="1.5" />
          <path d="M111 147v7m9-2v7m9-2v7m31-5v7m9-12v7m9-12v7" />
        </g>
        <g className="metric-art-part metric-tech-tile--left"><path className="metric-art-face" d="m45 62 27-15 27 15v27l-27 16-27-16Z" /><path d="m57 68 15-9 15 9m-15-9v18m-14 3 14 8 14-8" /><path className="metric-art-accent" d="M72 88v8" /></g>
        <g className="metric-art-part metric-tech-tile--right"><path className="metric-art-face" d="m192 163 27-15 27 15v27l-27 16-27-16Z" /><path className="metric-art-accent" d="m206 168-6 5 6 5m26-10 6 5-6 5m-12-12-4 15" /><path d="m202 189 17 10 17-10" /></g>
      </>}

      {index === 2 && <>
        <path className="metric-art-soft" d="M44 116v-51h65m123 66v59h-69" strokeDasharray="2 5" />
        <path d="M70 97h40l30 32h41v40h36M70 184h39l31-55h41V70h36" />
        <path className="metric-art-signal" d="M70 97h40l30 32h41v40h36" pathLength="100" />
        <path className="metric-art-signal metric-art-signal--reverse" d="M70 184h39l31-55h41V70h36" pathLength="100" />
        <g className="metric-art-part metric-workflow-input"><rect className="metric-art-face" x="41" y="76" width="47" height="40" rx="3" /><path className="metric-art-accent" d="m54 89-6 7 6 7m20-14 6 7-6 7m-8-17-5 21" /><path d="M41 84h47" /></g>
        <g className="metric-art-part metric-workflow-core"><path fill={`url(#${face})`} d="m140 101 25 14v29l-25 14-25-14v-29Z" stroke="currentColor" /><path className="metric-art-accent" d="m115 115 25 15 25-15m-25 15v28" /><path className="metric-art-soft" d="m129 112 11-6 12 6" /></g>
        <g className="metric-art-part metric-workflow-output"><rect className="metric-art-face" x="201" y="150" width="43" height="39" rx="3" /><path d="M210 162h25m-25 7h15m-15 7h18" /><path className="metric-art-accent" d="m228 176 4 4 7-9" /></g>
        <g className="metric-art-part metric-workflow-node"><circle className="metric-art-badge" cx="218" cy="70" r="17" /><path className="metric-art-accent" d="m211 70 5 5 9-10" /><circle className="metric-art-face" cx="69" cy="184" r="17" /><path d="m62 183 5 5 9-10" /></g>
        <circle className="metric-art-accent" cx="181" cy="129" r="3" fill="var(--metric-art-surface)" />
      </>}

      {index === 3 && <>
        <ellipse className="metric-art-floor" cx="144" cy="211" rx="88" ry="14" />
        <g className="metric-visitor-globe"><circle cx="144" cy="126" r="74" /><ellipse cx="144" cy="126" rx="35" ry="74" /><ellipse cx="144" cy="126" rx="74" ry="27" /><path className="metric-art-soft" d="M70 126h148m-74-74v148" /><path className="metric-art-accent" d="M144 52a74 74 0 0 1 74 74" /></g>
        <g className="metric-visitor-orbit"><ellipse className="metric-art-soft" cx="144" cy="126" rx="105" ry="44" transform="rotate(-32 144 126)" /><circle className="metric-art-accent metric-visitor-ping" cx="232" cy="71" r="4" /><circle className="metric-art-accent" cx="55" cy="180" r="3" /></g>
        <g className="metric-art-part metric-visitor-profile--front"><path className="metric-art-face" d="M47 140h43l10 10v41H47v-51Z" /><circle cx="71" cy="158" r="7" /><path className="metric-art-accent" d="M59 179v-2a12 12 0 0 1 24 0v2" /><path d="M90 140v10h10" /></g>
        <g className="metric-art-part metric-visitor-profile--back"><rect className="metric-art-face" x="193" y="49" width="40" height="44" rx="3" /><circle cx="213" cy="63" r="6" /><path d="M202 83v-2a11 11 0 0 1 22 0v2" /></g>
        <path className="metric-art-accent" d="M89 191h29l17-17m58-104h-24l-9 12" strokeDasharray="2 4" />
      </>}
    </svg>
  )
}
