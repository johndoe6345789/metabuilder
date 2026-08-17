'use client'

import { TextField } from '@/m3'
import s from './ComponentTreeTab.module.scss'

type Props = {
  label: string
  value: string
  onChange: (patch: Record<string, unknown>) => void
}

export function ComponentTreeStatProps({ label, value, onChange }: Props) {
  return (
    <div className={s.propCol}>
      <TextField
        size="small"
        fullWidth
        label="Value"
        value={value}
        onChange={event => {
          onChange({ value: event.target.value })
        }}
      />
      <TextField
        size="small"
        fullWidth
        label="Label"
        value={label}
        onChange={event => {
          onChange({ label: event.target.value })
        }}
      />
    </div>
  )
}
