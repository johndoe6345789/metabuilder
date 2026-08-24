/** Inline icons for the top app bar — kept out of AppBar.tsx to keep the
 *  bar's JSX readable as a layout, not a pile of path data. */

export function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <circle cx="12" cy="12" r="4.2" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M12 2.6v2.2M12 19.2v2.2M4.2 12H2M22 12h-2.2M6.1 6.1 4.5 4.5M19.5 19.5l-1.6-1.6M17.9 6.1l1.6-1.6M4.5 19.5l1.6-1.6" />
      </g>
    </svg>
  )
}

export function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        d="M20.5 14.3A8.6 8.6 0 0 1 9.7 3.5a8.6 8.6 0 1 0 10.8 10.8Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="17"
      height="17"
      className={className}
      aria-hidden="true"
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 3.8H6.6a1.8 1.8 0 0 0-1.8 1.8v12.8a1.8 1.8 0 0 0 1.8 1.8H14" />
        <path d="M16.6 8.4 20.2 12l-3.6 3.6M20.2 12H9.6" />
      </g>
    </svg>
  )
}
