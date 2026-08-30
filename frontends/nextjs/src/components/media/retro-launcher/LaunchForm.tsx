'use client'

import type { RetroSystem } from '@/hooks/useRetroSession'
import { SystemPicker } from '../SystemPicker'
import s from '../RetroLauncher.module.scss'

export interface LaunchFormProps {
  system: RetroSystem | null
  onSystemChange: (system: RetroSystem | null) => void
  romUrl: string
  onRomUrlChange: (url: string) => void
  loading: boolean
  error: string | null
  onLaunch: () => void
}

export function LaunchForm(props: LaunchFormProps) {
  const { system, romUrl, loading, error, onLaunch } = props
  const disabled = system === null || romUrl.trim().length === 0 || loading

  return (
    <>
      <p className={s.label}>Select system</p>
      <SystemPicker value={system} onChange={props.onSystemChange} />

      <label className={s.romLabel}>
        ROM URL (from S3 or any URL)
        <input
          className={s.romInput}
          type="url"
          placeholder="http://localhost:9000/games/mario.nes"
          value={romUrl}
          onChange={e => {
            props.onRomUrlChange(e.target.value)
          }}
        />
      </label>

      {error !== null && <p className={s.error}>{error}</p>}

      <button className={s.launch} disabled={disabled} onClick={onLaunch}>
        {loading ? 'Launching…' : `Launch ${system?.toUpperCase() ?? ''} game`}
      </button>
      <p className={s.keyHint}>
        Keyboard: Arrows=D-Pad · Z=A · X=B · Enter=Start · Shift=Select
      </p>
    </>
  )
}
