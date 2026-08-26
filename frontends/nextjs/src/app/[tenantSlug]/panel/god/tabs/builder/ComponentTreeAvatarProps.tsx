'use client'

import { Button, TextField } from '@/m3'
import s from './ComponentTreeTab.module.scss'

const SIZES = ['sm', 'md', 'lg', 'xl']

type Props = {
  initials: string
  src: string
  size: string
  onChange: (patch: Record<string, unknown>) => void
}

export function ComponentTreeAvatarProps({ initials, src, size, onChange }: Props) {
  return (
    <div className={s.propCol}>
      <TextField
        size="small"
        fullWidth
        label="Initials"
        value={initials}
        onChange={event => {
          onChange({ initials: event.target.value })
        }}
      />
      <TextField
        size="small"
        fullWidth
        label="Image URL (optional)"
        placeholder="https://…"
        value={src}
        onChange={event => {
          onChange({ src: event.target.value })
        }}
      />
      <div className={s.propRow}>
        {SIZES.map(sz => (
          <Button
            key={sz}
            size="small"
            variant={size === sz ? 'contained' : 'outlined'}
            onClick={() => {
              onChange({ size: sz })
            }}
          >
            {sz}
          </Button>
        ))}
      </div>
    </div>
  )
}
