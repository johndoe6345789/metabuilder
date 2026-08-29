'use client'

import type { SaveStatus } from './use-profile-form'
import s from './page.module.scss'

const MESSAGES: Record<Exclude<SaveStatus, 'idle'>, string> = {
  success: 'Profile saved successfully.',
  error: 'Failed to save profile. Please try again.',
}

/** The outcome of the last save, or nothing before one happens. */
export function SaveStatusMessage({ status }: { status: SaveStatus }) {
  if (status === 'idle') return null
  const tone = status === 'success' ? s.statusSuccess : s.statusError
  return <div className={`${s.statusMsg} ${tone}`}>{MESSAGES[status]}</div>
}
