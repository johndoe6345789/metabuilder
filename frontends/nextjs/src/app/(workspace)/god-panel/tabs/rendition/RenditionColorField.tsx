'use client'

import s from './RenditionTab.module.scss'

interface RenditionColorFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
}

export function RenditionColorField({
  label,
  value,
  onChange,
}: RenditionColorFieldProps) {
  return (
    <label className={s.colorField}>
      <span>{label}</span>
      <input
        type="color"
        value={value}
        onChange={event => {
          onChange(event.target.value)
        }}
      />
    </label>
  )
}
