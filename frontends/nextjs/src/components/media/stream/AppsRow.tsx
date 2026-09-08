'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useStreamApps } from './useStreamApps'
import { useRouteTenant } from '@/lib/tenant/use-route-tenant'
import { IframeModal } from './IframeModal'
import { AppsSettingsModal } from './AppsSettingsModal'
import { AppTile } from './AppTile'
import s from './AppsRow.module.scss'

export function AppsRow() {
  // The community whose page this is -- these apps used to be read from,
  // and written to, the instance's own `system` tenant.
  const tenant = useRouteTenant()
  const { apps, loading, error, createApp, updateApp, deleteApp } =
    useStreamApps(tenant)
  const [embedded, setEmbedded] = useState<{
    name: string
    url: string
  } | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <div className={s.root}>
      <span className={s.label}>Apps &amp; other services</span>
      <div className={s.row}>
        {!loading &&
          error === null &&
          apps.map((app, i) => (
            <AppTile
              key={app.id}
              app={app}
              index={i}
              onEmbed={(name, url) => {
                setEmbedded({ name, url })
              }}
            />
          ))}

        <button
          className={s.settingsTile}
          style={{ '--i': apps.length } as React.CSSProperties}
          onClick={() => {
            setSettingsOpen(true)
          }}
        >
          <span className={s.settingsIcon}>⚙</span>
          <span className={s.tileName}>Manage</span>
        </button>
      </div>

      {embedded !== null &&
        createPortal(
          <IframeModal
            name={embedded.name}
            url={embedded.url}
            onClose={() => {
              setEmbedded(null)
            }}
          />,
          document.body
        )}

      {settingsOpen &&
        createPortal(
          <AppsSettingsModal
            apps={apps}
            onClose={() => {
              setSettingsOpen(false)
            }}
            onCreate={createApp}
            onUpdate={updateApp}
            onDelete={deleteApp}
          />,
          document.body
        )}
    </div>
  )
}
