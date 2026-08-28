'use client'

import { TextField, Typography } from '@/m3'
import s from './ColorSwatch.module.scss'

interface ColorSwatchProps {
  varName: string
  value: string
  onChange: (key: string, val: string) => void
}

/** Strips the `--mat-sys-` prefix and converts kebab to Title Case */
function formatLabel(varName: string): string {
  const stripped = varName.replace(/^--mat-sys-/, '')
  return stripped
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export function ColorSwatch({ varName, value, onChange }: ColorSwatchProps) {
  return (
    <div className={s.row}>
      <span
        className={s.swatch}
        style={{ backgroundColor: value }}
        aria-hidden="true"
      />
      <Typography variant="body2" className={s.label}>
        {formatLabel(varName)}
      </Typography>
      <TextField
        className={s.input}
        size="small"
        value={value}
        aria-label={formatLabel(varName)}
        onChange={e => {
          onChange(varName, e.target.value)
        }}
      />
    </div>
  )
}
