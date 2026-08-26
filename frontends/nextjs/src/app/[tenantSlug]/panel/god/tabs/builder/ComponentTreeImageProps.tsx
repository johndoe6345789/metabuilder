'use client'

import { TextField } from '@/m3'
import s from './ComponentTreeTab.module.scss'

type Props = {
  src: string
  alt: string
  onChange: (patch: Record<string, unknown>) => void
}

export function ComponentTreeImageProps({ src, alt, onChange }: Props) {
  return (
    <div className={s.propCol}>
      <TextField
        size="small"
        fullWidth
        label="Image URL"
        placeholder="https://…"
        value={src}
        onChange={event => {
          onChange({ src: event.target.value })
        }}
      />
      <TextField
        size="small"
        fullWidth
        label="Alt text"
        value={alt}
        onChange={event => {
          onChange({ alt: event.target.value })
        }}
      />
    </div>
  )
}
