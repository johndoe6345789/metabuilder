'use client'

import type { RenditionConfig } from '@/store/slices/god-slice'
import { RenditionColorField } from './RenditionColorField'
import { DENSITIES } from './rendition-options'
import type { RenditionConfigController } from './use-rendition-config'
import s from './RenditionTab.module.scss'

interface RenditionDesignControlsProps {
  cfg: RenditionConfigController
}

export function RenditionDesignControls({ cfg }: RenditionDesignControlsProps) {
  const { rendition } = cfg

  return (
    <div className={s.designGrid}>
      <RenditionColorField
        label="Primary accent"
        value={rendition.primaryAccent}
        onChange={value => {
          cfg.patch({ primaryAccent: value })
        }}
      />
      <RenditionColorField
        label="Secondary accent"
        value={rendition.secondaryAccent}
        onChange={value => {
          cfg.patch({ secondaryAccent: value })
        }}
      />
      <label className={s.nativeField}>
        <span>Density</span>
        <select
          value={rendition.density}
          onChange={event => {
            cfg.patch({
              density: event.target.value as RenditionConfig['density'],
            })
          }}
        >
          {DENSITIES.map(density => (
            <option key={density} value={density}>
              {density}
            </option>
          ))}
        </select>
      </label>
      <label className={s.nativeField}>
        <span>Radius</span>
        <input
          type="number"
          min={8}
          max={32}
          value={rendition.borderRadius}
          onChange={event => {
            const nextRadius = Number(event.target.value)
            cfg.patch({
              borderRadius: Number.isFinite(nextRadius) ? nextRadius : 8,
            })
          }}
        />
      </label>
    </div>
  )
}
