'use client'

import { Typography } from '@/m3'
import type { PropField } from '@/components/blocks/block-props'
import s from './ComponentTreeTab.module.scss'

export interface BooleanPropFieldProps {
  field: PropField
  current: unknown
  onChange: (patch: Record<string, unknown>) => void
}

export function BooleanPropField({
  field,
  current,
  onChange,
}: BooleanPropFieldProps) {
  return (
    <label className={s.propCheck}>
      <input
        type="checkbox"
        checked={current === true}
        onChange={event => {
          onChange({ [field.name]: event.target.checked })
        }}
      />
      <span>
        {field.label}
        {field.hint !== undefined && (
          <Typography variant="caption" component="span" className={s.propHint}>
            {field.hint}
          </Typography>
        )}
      </span>
    </label>
  )
}
