'use client'

import s from '../PackageManager.module.scss'

export interface IconPickerProps {
  options: readonly string[]
  value: string
  onChange: (value: string) => void
}

/** A row of icon buttons, one active at a time. */
export function IconPicker({ options, value, onChange }: IconPickerProps) {
  return (
    <div className={s.chips}>
      {options.map(icon => (
        <button
          key={icon}
          type="button"
          className={`${s.iconChip} ${value === icon ? s.iconChipActive : ''}`}
          onClick={() => {
            onChange(icon)
          }}
        >
          <span className="material-symbols-rounded">{icon}</span>
        </button>
      ))}
    </div>
  )
}
