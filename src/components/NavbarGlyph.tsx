type NavbarGlyphProps = { name: 'home' | 'lab' | 'ai' | 'numbers' | 'theme' }

// Original 48-unit emblems: a clear silhouette with inset technical details.
export default function NavbarGlyph({ name }: NavbarGlyphProps) {
  return (
    <svg className="navbar-glyph" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="miter" aria-hidden="true" focusable="false">
      {name === 'home' && <>
        <path d="M5 19 24 3l19 16M9 22v16l8 7h14l8-7V22" strokeWidth="2.4" />
        <path d="m13 22 11-9 11 9v14h-8v-9h-6v9h-8Z" strokeWidth="2.2" />
        <path d="m17 18 7-6 7 6M13 40h5m12 0h5" strokeWidth="1.2" opacity=".6" />
        <path d="M2 13v-3h4m36 0h4v3" strokeWidth="1.3" opacity=".6" />
        <path className="navbar-glyph-accent" d="M21 41h6M24 17v4" strokeWidth="2.5" />
        <path d="M12 25h3m18 0h3" strokeWidth="1.2" />
      </>}
      {name === 'lab' && <>
        <path d="m18 6 6-3 18 10v9m0 7v6L24 45 6 35v-6M6 22v-9l6-3" strokeWidth="2.3" />
        <path d="m24 11 12 7v13l-12 7-12-7V18Z" strokeWidth="1.6" />
        <path d="m12 18 12 7 12-7M24 25v13" strokeWidth="1.7" />
        <path d="m18 15 12 7v12M18 22v12m12-19-12 7" strokeWidth="1.1" opacity=".6" />
        <path className="navbar-glyph-accent" d="m24 18 6 3.5v7L24 32l-6-3.5v-7Z" strokeWidth="1.8" />
        <path className="navbar-glyph-accent" d="M2 25h8m28 0h8" strokeWidth="1.5" />
        <path d="m24 3 3 2-3 2-3-2Zm0 38 3 2-3 2-3-2Z" fill="currentColor" stroke="none" />
      </>}
      {name === 'ai' && <>
        <path d="M13 5h22l7 7v19l-7 7H23l-11 7v-7l-6-6V12Z" strokeWidth="2.1" />
        <path d="m13 23 11-7 11 7-11 7Z" strokeWidth="2" />
        <path d="M13 23H9m26 0h4M24 16V9m0 21v5" strokeWidth="1.4" />
        <path d="M12 13h5l3 3m16 17h-5l-3-3M11 30h4l3-3m18-13h-4l-3 3" strokeWidth="1.2" opacity=".7" />
        <path className="navbar-glyph-accent" d="m24 19 4 4-4 4-4-4Z" fill="currentColor" stroke="none" />
        <g className="navbar-glyph-accent" fill="currentColor" stroke="none"><circle cx="12" cy="13" r="1.6" /><circle cx="36" cy="33" r="1.6" /><circle cx="24" cy="9" r="1.6" /></g>
        <path d="M16 9h3m10 25h3" strokeWidth="1.2" opacity=".6" />
      </>}
      {name === 'numbers' && <>
        <path d="M7 4h28l8 8v27l-5 5H5V10Z" strokeWidth="2.2" />
        <path d="M7 12h34M35 4v8h8M11 39h26" strokeWidth="1.2" opacity=".7" />
        <path d="M12 28h5v7h-5Zm10-7h5v14h-5Zm10-5h5v19h-5Z" fill="currentColor" fillOpacity=".16" strokeWidth="1.6" />
        <path className="navbar-glyph-accent" d="m12 23 11-7 6 1 7-8" strokeWidth="1.7" />
        <g className="navbar-glyph-accent" fill="currentColor" stroke="none"><circle cx="12" cy="23" r="1.7" /><circle cx="23" cy="16" r="1.7" /><circle cx="29" cy="17" r="1.7" /></g>
        <path d="M11 8h2m3 0h2m3 0h2M9 32v3m30-17v3" strokeWidth="1.3" />
      </>}
      {name === 'theme' && <>
        <path d="M15 7h18l8 8v18l-8 8H15l-8-8V15Z" strokeWidth="1.3" opacity=".5" />
        <path d="M28 12a13 13 0 1 0 8 21 12 12 0 0 1-8-21Z" strokeWidth="2.4" fill="currentColor" fillOpacity=".12" />
        <path d="M24 1v4M1 24h4m38 0h4M24 43v4M7 7l4 4m26 26 4 4" strokeWidth="2" />
        <path d="m12 26 4-4m-2 10 6-6" strokeWidth="1.2" opacity=".6" />
        <path className="navbar-glyph-accent" d="M36 9v10m-5-5h10M7 41l4-4" strokeWidth="2" />
        <path d="M36 2h7v7M2 36v7h7" strokeWidth="1.2" opacity=".6" />
      </>}
    </svg>
  )
}
