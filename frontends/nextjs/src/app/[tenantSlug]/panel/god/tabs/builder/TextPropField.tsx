'use client'

import { TextField } from '@/m3'
import type { PropField } from '@/components/blocks/block-props'

export interface TextPropFieldProps {
  field: PropField
  current: unknown
  onChange: (patch: Record<string, unknown>) => void
}

export function TextPropField({
  field,
  current,
  onChange,
}: TextPropFieldProps) {
  return (
    <TextField
      size="small"
      fullWidth
      label={field.label}
      placeholder={field.placeholder}
      helperText={field.hint}
      value={typeof current === 'string' ? current : ''}
      onChange={event => {
        onChange({ [field.name]: event.target.value })
      }}
    />
  )
}
