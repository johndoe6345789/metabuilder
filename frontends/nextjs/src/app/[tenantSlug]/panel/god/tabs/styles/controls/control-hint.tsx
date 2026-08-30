'use client'

import type { ReactNode } from 'react'
import { Typography } from '@/m3'
import type { StyleControl } from '../style-controls'
import s from '../CssClassesTab.module.scss'

/** The optional explanatory caption every control kind may show. */
export function controlHint(control: Pick<StyleControl, 'hint'>): ReactNode {
  if (control.hint === undefined) return null
  return (
    <Typography variant="caption" className={s.ctrlHint}>
      {control.hint}
    </Typography>
  )
}
