'use client'

import { useState } from 'react'
import type { StreamApp, EmbedMode } from './useStreamApps'
import s from './AppsSettingsModal.module.scss'

interface Props {
  apps: StreamApp[]
  onClose: () => void
  onCreate: (app: StreamApp) => Promise<void>
  onUpdate: (id: string, patch: Partial<StreamApp>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

const BLANK: Omit<StreamApp, 'id'> = {
  name: '',
  url: '',
  bgColor: '#222222',
  fgColor: '#ffffff',
  embedMode: 'newtab',
  sortOrder: 0,
}

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'app'
  )
}

export function AppsSettingsModal({
  apps,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
}: Props) {
  const [draft, setDraft] = useState<Omit<StreamApp, 'id'>>(BLANK)
  const [busy, setBusy] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const handleAdd = async () => {
    if (draft.name.trim() === '' || draft.url.trim() === '') {
      setFormError('Name and URL are required')
      return
    }
    setBusy('__new__')
    setFormError(null)
    try {
      await onCreate({
        id: `${slugify(draft.name)}-${Date.now().toString(36)}`,
        ...draft,
        sortOrder: apps.length,
      })
      setDraft(BLANK)
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Failed to add app')
    } finally {
      setBusy(null)
    }
  }

  const handleEmbedModeChange = async (app: StreamApp, mode: EmbedMode) => {
    setBusy(app.id)
    try {
      await onUpdate(app.id, { embedMode: mode })
    } finally {
      setBusy(null)
    }
  }

  const handleDelete = async (id: string) => {
    setBusy(id)
    try {
      await onDelete(id)
    } finally {
      setBusy(null)
    }
  }

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
          <div className={s.list}>
            {apps.map(app => (
              <div key={app.id} className={s.row}>
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
                  disabled={busy === app.id}
                  onChange={e => {
                    void handleEmbedModeChange(app, e.target.value as EmbedMode)
                  }}
                >
                  <option value="newtab">New tab</option>
                  <option value="iframe">Embed (iframe)</option>
                </select>
                <button
                  className={s.deleteBtn}
                  disabled={busy === app.id}
                  onClick={() => {
                    void handleDelete(app.id)
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
            {apps.length === 0 && (
              <p className={s.empty}>No apps yet — add one below.</p>
            )}
          </div>

          <div className={s.addForm}>
            <span className={s.addLabel}>Add a service</span>
            <div className={s.addGrid}>
              <input
                className={s.input}
                placeholder="Name"
                value={draft.name}
                onChange={e => {
                  setDraft({ ...draft, name: e.target.value })
                }}
              />
              <input
                className={s.input}
                placeholder="https://..."
                value={draft.url}
                onChange={e => {
                  setDraft({ ...draft, url: e.target.value })
                }}
              />
              <label className={s.colorField}>
                <span>Background</span>
                <input
                  type="color"
                  value={draft.bgColor}
                  onChange={e => {
                    setDraft({ ...draft, bgColor: e.target.value })
                  }}
                />
              </label>
              <label className={s.colorField}>
                <span>Text</span>
                <input
                  type="color"
                  value={draft.fgColor}
                  onChange={e => {
                    setDraft({ ...draft, fgColor: e.target.value })
                  }}
                />
              </label>
              <select
                className={s.select}
                value={draft.embedMode}
                onChange={e => {
                  setDraft({ ...draft, embedMode: e.target.value as EmbedMode })
                }}
              >
                <option value="newtab">New tab</option>
                <option value="iframe">Embed (iframe)</option>
              </select>
              <button
                className={s.addBtn}
                disabled={busy === '__new__'}
                onClick={() => {
                  void handleAdd()
                }}
              >
                {busy === '__new__' ? 'Adding…' : '+ Add'}
              </button>
            </div>
            {formError !== null && <p className={s.formError}>{formError}</p>}
            <p className={s.hint}>
              Most streaming services block iframe embedding on purpose
              (X-Frame-Options/CSP) — &quot;Embed&quot; will only actually show
              content for services that allow it.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
