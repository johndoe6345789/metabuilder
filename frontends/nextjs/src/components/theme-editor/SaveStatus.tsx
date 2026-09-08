'use client'

import { Typography } from '@/m3'
import type { SaveStatus as Status } from './theme-defaults'
import s from './ThemeEditor.module.scss'

export interface SaveStatusProps {
  status: Status
  error: string | null
}

/**
 * What happened to the last Save. Silence used to mean either "saved" or
 * "the data layer refused and this browser kept a copy" -- and only the
 * first of those reaches a visitor.
 */
export function SaveStatus({ status, error }: SaveStatusProps) {
  if (status === 'idle') return null
  if (status === 'saving') {
    return (
      <Typography variant="body2" role="status" className={s.status}>
        Saving…
      </Typography>
    )
  }
  if (status === 'saved') {
    return (
      <Typography variant="body2" role="status" className={s.status}>
        Saved — visitors to this site will see these colours.
      </Typography>
    )
  }
  return (
    <Typography variant="body2" role="alert" className={s.statusError}>
      Kept in this browser only — the data layer refused the save
      {error === null ? '' : ` (${error})`}. Visitors still see the previous
      colours; try again.
    </Typography>
  )
}
