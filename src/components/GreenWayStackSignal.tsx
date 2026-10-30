type StackSignalKind = 'interface' | 'services' | 'media' | 'additional'

const routes: Record<StackSignalKind, string> = {
  interface: 'M49 17h11l9 8h8',
  services: 'M29 18h15V8h18l10 10h10',
  media: 'M43 18h17l8-8h17',
  additional: 'M12 18h28l12-10h22l12 10h14',
}

export default function GreenWayStackSignal({ kind }: { kind: StackSignalKind }) {
  return <svg className={`greenway-stack-signal greenway-stack-signal--${kind}`} viewBox="0 0 112 38" fill="none" aria-hidden="true" focusable="false">
    <path className="stack-signal-guide" d="M3 4h6m94 0h6M3 34h6m94 0h6" />
    {kind === 'interface' && <>
      <path d="M8 7h41v23H8zM8 12h41m-27 18v4m-8 0h17M77 13h16v21H77zM81 17h8" />
      <g className="stack-signal-bars"><path d="M14 18h19" /><path d="M14 22h13" /><path d="M81 25h8" /></g>
    </>}
    {kind === 'services' && <>
      <path d="M8 5h21v28H8zM12 12h9m-9 7h9m-9 7h9M82 13v15c0 6 23 6 23 0V13m-23 7c0 6 23 6 23 0" />
      <ellipse cx="93.5" cy="13" rx="11.5" ry="4" />
      <g className="stack-signal-bars"><path d="M24 11v2" /><path d="M24 18v2" /><path d="M24 25v2" /></g>
    </>}
    {kind === 'media' && <>
      <circle cx="30" cy="18" r="12" /><ellipse cx="30" cy="18" rx="5" ry="12" /><path d="M18 18h24m-22-6h20m-20 12h20M85 5h19v24H85zM89 24l4-5 3 3 4-5" />
      <circle className="stack-signal-node" cx="30" cy="6" r="2" /><circle cx="91" cy="11" r="1.5" />
    </>}
    {kind === 'additional' && <><path d="M40 18v12h20m14-22v18h14" /><circle cx="12" cy="18" r="3" /><circle cx="60" cy="30" r="3" /><circle cx="88" cy="26" r="3" /><circle cx="100" cy="18" r="3" /></>}
    <path className="stack-signal-guide" d={routes[kind]} />
    <path className="stack-signal-flow" d={routes[kind]} pathLength="1" />
  </svg>
}
