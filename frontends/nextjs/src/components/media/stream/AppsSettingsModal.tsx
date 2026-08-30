'use client'

import type { StreamApp } from './useStreamApps'
import { useAppDraft } from './apps-settings/use-app-draft'
import { AppsList } from './apps-settings/AppsList'
import { AddAppForm } from './apps-settings/AddAppForm'
import s from './AppsSettingsModal.module.scss'

interface Props {
  apps: StreamApp[]
  onClose: () => void
  onCreate: (app: StreamApp) => Promise<void>
  onUpdate: (id: string, patch: Partial<StreamApp>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function AppsSettingsModal({
  apps,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
}: Props) {
  const {
    draft,
    setDraft,
    busy,
    formError,
    handleAdd,
    handleEmbedModeChange,
    handleDelete,
  } = useAppDraft({ apps, onCreate, onUpdate, onDelete })

  return (
    <div className={s.overlay} onClick={onClose}>
      <div
        className={s.panel}
        onClick={e => {
          e.stopPropagation()
        }}
      >
        <div className={s.header}>
          <span className={s.title}>Manage apps &amp; services</span>
          <button className={s.closeBtn} onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className={s.body}>
          <AppsList
            apps={apps}
            busy={busy}
            onEmbedModeChange={(app, mode) => {
              void handleEmbedModeChange(app, mode)
            }}
            onDelete={id => {
              void handleDelete(id)
            }}
          />
          <AddAppForm
            draft={draft}
            onDraftChange={setDraft}
            busy={busy === '__new__'}
            formError={formError}
            onAdd={() => {
              void handleAdd()
            }}
          />
        </div>
      </div>
    </div>
  )
}
