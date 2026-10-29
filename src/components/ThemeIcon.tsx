import './ThemeIcon.css'

export default function ThemeIcon({ theme }: { theme: 'light' | 'dark' }) {
  return (
    <svg className="navbar-glyph theme-icon" data-mode={theme} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" focusable="false">
      <path className="theme-icon-frame" d="M15 5h18l10 10v18L33 43H15L5 33V15Z" strokeWidth="1" />
      <path className="theme-icon-frame" d="M2 12V2h10m24 0h10v10M2 36v10h10m24 0h10V36" strokeWidth="1.2" />
      <g className="theme-icon-sun">
        <circle cx="24" cy="24" r="8" strokeWidth="2.2" />
        <circle cx="24" cy="24" r="3" className="theme-icon-accent" fill="currentColor" stroke="none" />
        <path d="M24 8v5m0 22v5M8 24h5m22 0h5M12.7 12.7l3.5 3.5m15.6 15.6 3.5 3.5m0-22.6-3.5 3.5m-15.6 15.6-3.5 3.5" strokeWidth="2" />
      </g>
      <g className="theme-icon-moon">
        <path d="M28.5 11.5a13.5 13.5 0 1 0 8 23 13 13 0 0 1-8-23Z" strokeWidth="2.2" fill="currentColor" fillOpacity=".1" />
        <path className="theme-icon-accent" d="m35 12 1.6 4.4L41 18l-4.4 1.6L35 24l-1.6-4.4L29 18l4.4-1.6Z" strokeWidth="1.4" />
        <path d="M13 31h3m-1 4h3" strokeWidth="1.2" opacity=".6" />
      </g>
      <path className="theme-icon-accent" d="M20 43h8M5 21v6" strokeWidth="2" />
    </svg>
  )
}
