'use client'

import type { StreamApp } from './useStreamApps'
import s from './AppsRow.module.scss'

export interface AppTileProps {
  app: StreamApp
  index: number
  onEmbed: (name: string, url: string) => void
}

export function AppTile({ app, index, onEmbed }: AppTileProps) {
  return (
    <a
      href={app.url}
      target={app.embedMode === 'newtab' ? '_blank' : undefined}
      rel="noopener noreferrer"
      className={s.tile}
      style={
        {
          '--bg': app.bgColor,
          '--fg': app.fgColor,
          '--i': index,
        } as React.CSSProperties
      }
      onClick={e => {
        if (app.embedMode === 'iframe') {
          e.preventDefault()
          onEmbed(app.name, app.url)
        }
      }}
    >
      <span className={s.tileName}>{app.name}</span>
      <span className={s.tileArrow}>
        {app.embedMode === 'iframe' ? '⛶' : '↗'}
      </span>
    </a>
  )
}
