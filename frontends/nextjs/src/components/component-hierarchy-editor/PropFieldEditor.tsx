'use client'

import { TextField, Switch, FormControl, InputLabel, Typography }
  from '@/m3'
import type { PropField } from './types'
import s from './ConfigDialog.module.scss'

type Props = {
  field: PropField
  value: unknown
  onChange: (name: string, value: unknown) => void
}

export function PropFieldEditor({ field, value, onChange }: Props) {
  if (field.type === 'boolean') {
    return (
      <div className={s.switchRow}>
        <Typography variant="body2">{field.name}</Typography>
        <Switch
          checked={Boolean(value ?? false)}
          onChange={e => { onChange(field.name, e.target.checked) }}
          aria-label={field.name}
        />
      </div>
    )
  }

  if (field.type === 'select') {
    return (
      <FormControl fullWidth size="small">
        <InputLabel>{field.name}</InputLabel>
        <select
          className={s.nativeSelect}
          value={String(value ?? '')}
          onChange={e => { onChange(field.name, e.target.value) }}
          aria-label={field.name}
        >
          {field.options?.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </FormControl>
    )
  }

  return (
    <TextField
      fullWidth
      size="small"
      label={field.name}
      type={field.type === 'number' ? 'number' : 'text'}
      value={String(value ?? '')}
      onChange={e => {
        const v = field.type === 'number'
          ? Number(e.target.value)
          : e.target.value
        onChange(field.name, v)
      }}
    />
  )
}
