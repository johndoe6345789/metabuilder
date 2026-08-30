'use client'

import type { EmbedMode, StreamApp } from '../useStreamApps'
import { ColorField } from './ColorField'
import { EmbedHint } from './EmbedHint'
import s from '../AppsSettingsModal.module.scss'

export interface AddAppFormProps {
  draft: Omit<StreamApp, 'id'>
  onDraftChange: (draft: Omit<StreamApp, 'id'>) => void
  busy: boolean
  formError: string | null
  onAdd: () => void
}

export function AddAppForm({
  draft,
  onDraftChange,
  busy,
  formError,
  onAdd,
}: AddAppFormProps) {
  return (
    <div className={s.addForm}>
      <span className={s.addLabel}>Add a service</span>
      <div className={s.addGrid}>
        <input
          className={s.input}
          placeholder="Name"
          value={draft.name}
          onChange={e => {
            onDraftChange({ ...draft, name: e.target.value })
          }}
        />
        <input
          className={s.input}
          placeholder="https://..."
          value={draft.url}
          onChange={e => {
            onDraftChange({ ...draft, url: e.target.value })
          }}
        />
        <ColorField
          label="Background"
          value={draft.bgColor}
          onChange={bgColor => {
            onDraftChange({ ...draft, bgColor })
          }}
        />
        <ColorField
          label="Text"
          value={draft.fgColor}
          onChange={fgColor => {
            onDraftChange({ ...draft, fgColor })
          }}
        />
        <select
          className={s.select}
          value={draft.embedMode}
          onChange={e => {
            onDraftChange({
              ...draft,
              embedMode: e.target.value as EmbedMode,
            })
          }}
        >
          <option value="newtab">New tab</option>
          <option value="iframe">Embed (iframe)</option>
        </select>
        <button className={s.addBtn} disabled={busy} onClick={onAdd}>
          {busy ? 'Adding…' : '+ Add'}
        </button>
      </div>
      {formError !== null && <p className={s.formError}>{formError}</p>}
      <EmbedHint />
    </div>
  )
}
