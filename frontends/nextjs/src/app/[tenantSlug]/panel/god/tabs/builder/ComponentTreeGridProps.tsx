'use client'

import { TextField } from '@/m3'
import s from './ComponentTreeTab.module.scss'

type Props = {
  columns: string
  gap: string
  onChange: (patch: Record<string, unknown>) => void
}

export function ComponentTreeGridProps({ columns, gap, onChange }: Props) {
  return (
    <div className={s.propRow}>
      <TextField
        size="small"
        label="Columns"
        value={columns}
        onChange={event => {
          onChange({ columns: Number(event.target.value) || 1 })
        }}
      />
      <TextField
        size="small"
        label="Gap"
        value={gap}
        onChange={event => {
          onChange({ gap: Number(event.target.value) || 0 })
        }}
      />
    </div>
  )
}
