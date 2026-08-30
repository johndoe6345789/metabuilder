'use client'

import s from '../AppsSettingsModal.module.scss'

export interface ColorFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
}

export function ColorField({ label, value, onChange }: ColorFieldProps) {
  return (
    <label className={s.colorField}>
      <span>{label}</span>
      <input
        type="color"
        value={value}
        onChange={e => {
          onChange(e.target.value)
        }}
      />
    </label>
  )
}
