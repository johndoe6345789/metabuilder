'use client'

import s from './AppsRow.module.scss'

interface AppTile {
  name: string
  url: string
  bg: string
  fg: string
}

// Text-based brand tiles (not recreations of each service's actual
// logo/wordmark) linking to the real service. These open in a new tab
// rather than an <iframe> — Netflix, Disney+, Prime Video, Max, and Hulu
// all send X-Frame-Options/Content-Security-Policy: frame-ancestors
// headers that block embedding by design (anti-clickjacking, DRM
// licensing terms), so an iframe here would just render blank. That's a
// deliberate choice on their end, not a gap in this implementation.
const APPS: AppTile[] = [
  { name: 'Netflix', url: 'https://www.netflix.com', bg: '#000000', fg: '#e50914' },
  { name: 'YouTube', url: 'https://www.youtube.com', bg: '#ffffff', fg: '#ff0000' },
  { name: 'Disney+', url: 'https://www.disneyplus.com', bg: '#0c1e3e', fg: '#ffffff' },
  { name: 'Prime Video', url: 'https://www.primevideo.com', bg: '#00a8e1', fg: '#0f1111' },
  { name: 'Twitch', url: 'https://www.twitch.tv', bg: '#6441a5', fg: '#ffffff' },
  { name: 'Spotify', url: 'https://open.spotify.com', bg: '#1db954', fg: '#000000' },
]

export function AppsRow() {
  return (
    <div className={s.root}>
      <span className={s.label}>Apps &amp; other services</span>
      <div className={s.row}>
        {APPS.map((app, i) => (
          <a
            key={app.name}
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
            className={s.tile}
            style={{ '--bg': app.bg, '--fg': app.fg, '--i': i } as React.CSSProperties}
          >
            <span className={s.tileName}>{app.name}</span>
            <span className={s.tileArrow}>↗</span>
          </a>
        ))}
      </div>
    </div>
  )
}
