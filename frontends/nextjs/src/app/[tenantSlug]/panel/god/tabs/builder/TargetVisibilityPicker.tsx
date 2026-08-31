'use client'

import { Chip, Typography } from '@/m3'
import s from './ComponentTreeTab.module.scss'

export interface TargetVisibilityPickerProps {
  requiresAuth: boolean
  onChange: (requiresAuth: boolean) => void
}

export function TargetVisibilityPicker({
  requiresAuth,
  onChange,
}: TargetVisibilityPickerProps) {
  return (
    <div className={s.targetPickerRow}>
      <Typography variant="caption" color="text.secondary">
        Visibility
      </Typography>
      <div className={s.chips}>
        <Chip
          label="Public"
          size="small"
          color={!requiresAuth ? 'primary' : 'default'}
          variant={!requiresAuth ? 'filled' : 'outlined'}
          onClick={() => {
            onChange(false)
          }}
        />
        <Chip
          label="Requires login"
          size="small"
          color={requiresAuth ? 'primary' : 'default'}
          variant={requiresAuth ? 'filled' : 'outlined'}
          onClick={() => {
            onChange(true)
          }}
        />
      </div>
    </div>
  )
}
