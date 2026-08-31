'use client'

import { Chip, Typography } from '@/m3'
import s from './ComponentTreeTab.module.scss'

/** 0=public, 1=user, 2=moderator, 3=admin, 4=god, 5=supergod — ROLE_LEVELS */
const LEVELS = [
  { value: 0, label: 'Public' },
  { value: 1, label: 'User' },
  { value: 2, label: 'Moderator' },
  { value: 3, label: 'Admin' },
  { value: 4, label: 'God' },
  { value: 5, label: 'SuperGod' },
]

export interface TargetLevelPickerProps {
  level: number
  onChange: (level: number) => void
}

export function TargetLevelPicker({ level, onChange }: TargetLevelPickerProps) {
  return (
    <div className={s.targetPickerRow}>
      <Typography variant="caption" color="text.secondary">
        Access level
      </Typography>
      <div className={s.chips}>
        {LEVELS.map(lvl => (
          <Chip
            key={lvl.value}
            label={lvl.label}
            size="small"
            color={level === lvl.value ? 'primary' : 'default'}
            variant={level === lvl.value ? 'filled' : 'outlined'}
            onClick={() => {
              onChange(lvl.value)
            }}
          />
        ))}
      </div>
    </div>
  )
}
