'use client'

import { TextField } from '@/m3'
import type { RenditionNavItem } from '@/store/slices/god-slice'
import { RenditionAccessLevelSelect } from './RenditionAccessLevelSelect'
import type { RenditionConfigController } from './use-rendition-config'
import s from './RenditionTab.module.scss'

interface RenditionNavRowProps {
  cfg: RenditionConfigController
  item: RenditionNavItem
}

export function RenditionNavRow({ cfg, item }: RenditionNavRowProps) {
  return (
    <div className={s.navRow}>
      <label className={s.toggle}>
        <input
          type="checkbox"
          checked={item.enabled}
          onChange={event => {
            cfg.patchNavItem(item.id, { enabled: event.target.checked })
          }}
        />
        Enabled
      </label>
      <TextField
        size="small"
        label="Label"
        value={item.label}
        onChange={event => {
          cfg.patchNavItem(item.id, { label: event.target.value })
        }}
      />
      <TextField
        size="small"
        label="Path"
        value={item.path}
        onChange={event => {
          cfg.patchNavItem(item.id, { path: event.target.value })
        }}
      />
      <RenditionAccessLevelSelect
        value={item.minLevel}
        onChange={minLevel => {
          cfg.patchNavItem(item.id, { minLevel })
        }}
      />
      <button
        type="button"
        className={s.iconButton}
        onClick={() => {
          cfg.removeNavItem(item.id)
        }}
      >
        <span className="material-symbols-rounded">delete</span>
      </button>
    </div>
  )
}
