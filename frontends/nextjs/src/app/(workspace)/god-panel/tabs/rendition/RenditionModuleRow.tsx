'use client'

import { TextField } from '@/m3'
import type { RenditionModule } from '@/store/slices/god-slice'
import { RenditionAccessLevelSelect } from './RenditionAccessLevelSelect'
import type { RenditionConfigController } from './use-rendition-config'
import s from './RenditionTab.module.scss'

interface RenditionModuleRowProps {
  cfg: RenditionConfigController
  module: RenditionModule
}

export function RenditionModuleRow({ cfg, module }: RenditionModuleRowProps) {
  return (
    <div className={s.moduleRow}>
      <label className={s.toggle}>
        <input
          type="checkbox"
          checked={module.enabled}
          onChange={event => {
            cfg.patchModule(module.id, { enabled: event.target.checked })
          }}
        />
        Enabled
      </label>
      <TextField
        size="small"
        label="Label"
        value={module.label}
        onChange={event => {
          cfg.patchModule(module.id, { label: event.target.value })
        }}
      />
      <TextField
        size="small"
        label="Description"
        value={module.description}
        onChange={event => {
          cfg.patchModule(module.id, { description: event.target.value })
        }}
      />
      <RenditionAccessLevelSelect
        value={module.minLevel}
        onChange={minLevel => {
          cfg.patchModule(module.id, { minLevel })
        }}
      />
      <label className={s.toggle}>
        <input
          type="checkbox"
          checked={module.pinned}
          onChange={event => {
            cfg.patchModule(module.id, { pinned: event.target.checked })
          }}
        />
        Pinned
      </label>
      <button
        type="button"
        className={s.iconButton}
        onClick={() => {
          cfg.removeModule(module.id)
        }}
      >
        <span className="material-symbols-rounded">delete</span>
      </button>
    </div>
  )
}
