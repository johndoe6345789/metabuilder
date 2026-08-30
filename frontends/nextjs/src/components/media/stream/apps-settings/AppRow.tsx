'use client'

import type { EmbedMode, StreamApp } from '../useStreamApps'
import s from '../AppsSettingsModal.module.scss'

export interface AppRowProps {
  app: StreamApp
  busy: boolean
  onEmbedModeChange: (mode: EmbedMode) => void
  onDelete: () => void
}

export function AppRow(props: AppRowProps) {
  const { app, busy, onEmbedModeChange, onDelete } = props
  return (
    <div className={s.row}>
      <span
        className={s.swatch}
        style={{ background: app.bgColor, color: app.fgColor }}
      >
        {app.name.charAt(0).toUpperCase()}
      </span>
      <div className={s.rowInfo}>
        <span className={s.rowName}>{app.name}</span>
        <span className={s.rowUrl}>{app.url}</span>
      </div>
      <select
        className={s.select}
        value={app.embedMode}
        disabled={busy}
        onChange={e => {
          onEmbedModeChange(e.target.value as EmbedMode)
        }}
      >
        <option value="newtab">New tab</option>
        <option value="iframe">Embed (iframe)</option>
      </select>
      <button className={s.deleteBtn} disabled={busy} onClick={onDelete}>
        Remove
      </button>
    </div>
  )
}
