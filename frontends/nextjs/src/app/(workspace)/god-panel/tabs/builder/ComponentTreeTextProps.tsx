'use client'

import { TextField } from '@/m3'

type Props = {
  value: string
  onChange: (text: string) => void
}

export function ComponentTreeTextProps({ value, onChange }: Props) {
  return (
    <TextField
      size="small"
      fullWidth
      label="Text"
      value={value}
      onChange={event => {
        onChange(event.target.value)
      }}
    />
  )
}
