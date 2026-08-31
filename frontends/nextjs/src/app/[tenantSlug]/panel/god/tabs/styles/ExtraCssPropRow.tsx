'use client'

import { TextField } from '@/m3'
import s from './CssClassesTab.module.scss'

export interface ExtraCssPropRowProps {
  prop: string
  value: string
  onSet: (prop: string, value: string) => void
  onClear: (prop: string) => void
}

export function ExtraCssPropRow({
  prop,
  value,
  onSet,
  onClear,
}: ExtraCssPropRowProps) {
  return (
    <div className={s.propRow}>
      <span className={s.propKey}>{prop}</span>
      <TextField
        size="small"
        value={value}
        onChange={event => {
          onSet(prop, event.target.value)
        }}
      />
      <button
        className={s.del}
        onClick={() => {
          onClear(prop)
        }}
      >
        ✕
      </button>
    </div>
  )
}
