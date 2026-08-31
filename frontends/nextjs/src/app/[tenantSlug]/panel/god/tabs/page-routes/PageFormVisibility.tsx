'use client'

import { Typography, Chip } from '@/m3'
import type { PageRouteInput } from '@/hooks/usePageRoutes'
import type { PageFormOnChange } from './page-form-field-types'
import s from './PageFormFields.module.scss'

export interface PageFormVisibilityProps {
  requiresAuth: PageRouteInput['requiresAuth'] | undefined
  isPublished: PageRouteInput['isPublished'] | undefined
  onChange: PageFormOnChange
}

export function PageFormVisibility({
  requiresAuth,
  isPublished,
  onChange,
}: PageFormVisibilityProps) {
  return (
    <div className={s.section}>
      <Typography variant="caption" color="text.secondary">
        Visibility
      </Typography>
      <div className={s.chips}>
        <Chip
          label="Public"
          onClick={() => {
            onChange('requiresAuth', false)
          }}
          color={requiresAuth !== true ? 'primary' : 'default'}
          variant={requiresAuth !== true ? 'filled' : 'outlined'}
          size="small"
        />
        <Chip
          label="Requires login"
          onClick={() => {
            onChange('requiresAuth', true)
          }}
          color={requiresAuth === true ? 'primary' : 'default'}
          variant={requiresAuth === true ? 'filled' : 'outlined'}
          size="small"
        />
        <Chip
          label="Live"
          onClick={() => {
            onChange('isPublished', true)
          }}
          color={isPublished !== false ? 'success' : 'default'}
          variant={isPublished !== false ? 'filled' : 'outlined'}
          size="small"
        />
        <Chip
          label="Draft"
          onClick={() => {
            onChange('isPublished', false)
          }}
          color={isPublished === false ? 'warning' : 'default'}
          variant={isPublished === false ? 'filled' : 'outlined'}
          size="small"
        />
      </div>
    </div>
  )
}
