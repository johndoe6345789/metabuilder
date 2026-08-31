'use client'

import { Typography, Chip } from '@/m3'
import type { PageRouteInput } from '@/hooks/usePageRoutes'
import type { PageFormOnChange } from './page-form-field-types'
import s from './PageFormFields.module.scss'

// Matches ROLE_LEVELS (src/lib/constants.ts): 0=public, 1=user, 2=moderator,
// 3=admin, 4=god, 5=supergod.
const LEVELS = [
  { value: 0, label: 'Public', desc: 'Anyone can view' },
  { value: 1, label: 'User', desc: 'Logged-in users' },
  { value: 2, label: 'Moderator', desc: 'Moderators and up' },
  { value: 3, label: 'Admin', desc: 'Admin only' },
  { value: 4, label: 'God', desc: 'God tier' },
  { value: 5, label: 'SuperGod', desc: 'SuperGod only' },
]

export interface PageFormAccessLevelProps {
  level: PageRouteInput['level'] | undefined
  onChange: PageFormOnChange
}

export function PageFormAccessLevel({
  level,
  onChange,
}: PageFormAccessLevelProps) {
  return (
    <div className={s.section}>
      <Typography variant="caption" color="text.secondary">
        Access Level
      </Typography>
      <div className={s.chips}>
        {LEVELS.map(lvl => (
          <Chip
            key={lvl.value}
            label={lvl.label}
            onClick={() => {
              onChange('level', lvl.value)
            }}
            color={level === lvl.value ? 'primary' : 'default'}
            variant={level === lvl.value ? 'filled' : 'outlined'}
            size="small"
            title={lvl.desc}
          />
        ))}
      </div>
    </div>
  )
}
