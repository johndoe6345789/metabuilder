'use client'

import { LEVELS, type AccessLevel } from './rendition-options'
import s from './RenditionTab.module.scss'

interface RenditionAccessLevelSelectProps {
  value: AccessLevel
  onChange: (value: AccessLevel) => void
}

export function RenditionAccessLevelSelect({
  value,
  onChange,
}: RenditionAccessLevelSelectProps) {
  return (
    <label className={s.nativeField}>
      <span>Min level</span>
      <select
        value={value}
        onChange={event => {
          onChange(Number(event.target.value) as AccessLevel)
        }}
      >
        {LEVELS.map(level => (
          <option key={level} value={level}>
            L{level}
          </option>
        ))}
      </select>
    </label>
  )
}
