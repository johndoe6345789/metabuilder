'use client'

import { Alert } from '@/m3'
import type { Notice } from '../credentials-types'

const SEVERITY = {
  error: 'error',
  success: 'success',
  info: 'info',
} as const

/** The last thing that happened, or nothing before anything has. */
export function NoticeAlert({ notice }: { notice: Notice | null }) {
  if (notice === null) return null
  return <Alert severity={SEVERITY[notice.kind]}>{notice.message}</Alert>
}
