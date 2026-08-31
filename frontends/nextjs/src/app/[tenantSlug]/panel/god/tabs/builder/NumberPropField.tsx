'use client'

import { TextField } from '@/m3'
import type { PropField } from '@/components/blocks/block-props'

export interface NumberPropFieldProps {
  field: PropField
  current: unknown
  onChange: (patch: Record<string, unknown>) => void
}

export function NumberPropField({
  field,
  current,
  onChange,
}: NumberPropFieldProps) {
  return (
    <TextField
      size="small"
      fullWidth
      type="number"
      label={field.label}
      helperText={field.hint}
      value={typeof current === 'number' ? String(current) : ''}
      onChange={event => {
        // An emptied field means "no value", not zero. `Number('') || 0`
        // turned every clear into a 0 that could not be undone, so a
        // badge's count could never be returned to its default.
        const raw = event.target.value
        if (raw === '') {
          onChange({ [field.name]: undefined })
          return
        }
        const parsed = Number(raw)
        onChange({ [field.name]: Number.isNaN(parsed) ? undefined : parsed })
      }}
    />
  )
}
