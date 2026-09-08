'use client'

import { Typography, Chip } from '@/m3'
import type { PageRouteInput } from '@/hooks/usePageRoutes'
import { PAGE_LEVELS } from '@/lib/tenant/page-levels'
import type { PageFormOnChange } from './page-form-field-types'
import s from './PageFormFields.module.scss'


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
        {PAGE_LEVELS.map(lvl => (
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
