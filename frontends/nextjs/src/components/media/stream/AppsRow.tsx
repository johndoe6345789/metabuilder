'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useStreamApps } from './useStreamApps'
import { IframeModal } from './IframeModal'
import { AppsSettingsModal } from './AppsSettingsModal'
import s from './AppsRow.module.scss'

export function AppsRow() {
  const { apps, loading, error, createApp, updateApp, deleteApp } = useStreamApps()
  const [embedded, setEmbedded] = useState<{ name: string, url: string } | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <div className={s.root}>
      <span className={s.label}>Apps &amp; other services</span>
      <div className={s.row}>
        {!loading && error === null && apps.map((app, i) => (
          <a
            key={app.id}
            href={app.url}
            target={app.embedMode === 'newtab' ? '_blank' : undefined}
            rel="noopener noreferrer"
            className={s.tile}
            style={{ '--bg': app.bgColor, '--fg': app.fgColor, '--i': i } as React.CSSProperties}
            onClick={(e) => {
              if (app.embedMode === 'iframe') {
                e.preventDefault()
                setEmbedded({ name: app.name, url: app.url })
              }
            }}
          >
            <span className={s.tileName}>{app.name}</span>
            <span className={s.tileArrow}>{app.embedMode === 'iframe' ? '⛶' : '↗'}</span>
          </a>
        ))}

        <button
          className={s.settingsTile}
          style={{ '--i': apps.length } as React.CSSProperties}
          onClick={() => { setSettingsOpen(true) }}
        >
          <span className={s.settingsIcon}>⚙</span>
          <span className={s.tileName}>Manage</span>
        </button>
      </div>

      {embedded !== null && createPortal(
        <IframeModal name={embedded.name} url={embedded.url} onClose={() => { setEmbedded(null) }} />,
        document.body
      )}

      {settingsOpen && createPortal(
        <AppsSettingsModal
          apps={apps}
          onClose={() => { setSettingsOpen(false) }}
          onCreate={createApp}
          onUpdate={updateApp}
          onDelete={deleteApp}
        />,
        document.body
      )}
    </div>
  )
}
