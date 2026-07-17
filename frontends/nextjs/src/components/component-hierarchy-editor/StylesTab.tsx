'use client'

import { TextField, Button, IconButton } from '@/m3'
import s from './ConfigDialog.module.scss'

export type StylePair = { key: string; value: string }

type Props = {
  pairs: StylePair[]
  onAdd: () => void
  onRemove: (idx: number) => void
  onUpdate: (idx: number, field: 'key' | 'value', val: string) => void
}

export function StylesTab({ pairs, onAdd, onRemove, onUpdate }: Props) {
  return (
    <div className={s.styleList}>
      {pairs.map((pair, idx) => (
        <div key={idx} className={s.styleRow}>
          <TextField
            size="small"
            label="property"
            value={pair.key}
            onChange={e => { onUpdate(idx, 'key', e.target.value) }}
            className={s.styleKey}
          />
          <TextField
            size="small"
            label="value"
            value={pair.value}
            onChange={e => { onUpdate(idx, 'value', e.target.value) }}
            className={s.styleVal}
          />
          <IconButton
            size="small"
            aria-label="Remove style"
            onClick={() => { onRemove(idx) }}
          >
            ×
          </IconButton>
        </div>
      ))}
      <Button size="small" variant="outlined" onClick={onAdd}>
        + Add
      </Button>
    </div>
  )
}
