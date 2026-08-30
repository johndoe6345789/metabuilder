'use client'

import type { EmbedMode, StreamApp } from '../useStreamApps'
import { AppRow } from './AppRow'
import s from '../AppsSettingsModal.module.scss'

export interface AppsListProps {
  apps: StreamApp[]
  busy: string | null
  onEmbedModeChange: (app: StreamApp, mode: EmbedMode) => void
  onDelete: (id: string) => void
}

export function AppsList({
  apps,
  busy,
  onEmbedModeChange,
  onDelete,
}: AppsListProps) {
  if (apps.length === 0) {
    return (
      <div className={s.list}>
        <p className={s.empty}>No apps yet — add one below.</p>
      </div>
    )
  }

  return (
    <div className={s.list}>
      {apps.map(app => (
        <AppRow
          key={app.id}
          app={app}
          busy={busy === app.id}
          onEmbedModeChange={mode => {
            onEmbedModeChange(app, mode)
          }}
          onDelete={() => {
            onDelete(app.id)
          }}
        />
      ))}
    </div>
  )
}
