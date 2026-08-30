'use client'

import { Chip } from '@/m3'
import s from '../PackageManager.module.scss'

export interface ChipPickerProps<T extends string> {
  options: readonly T[]
  value: T
  onChange: (value: T) => void
}

/** A row of selectable chips, one active at a time. */
export function ChipPicker<T extends string>({
  options,
  value,
  onChange,
}: ChipPickerProps<T>) {
  return (
    <div className={s.chips}>
      {options.map(option => (
        <Chip
          key={option}
          label={option}
          size="small"
          color={value === option ? 'primary' : 'default'}
          variant={value === option ? 'filled' : 'outlined'}
          onClick={() => {
            onChange(option)
          }}
        />
      ))}
    </div>
  )
}
