'use client'

import { useCallback, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setSmtp, clearDirty } from '@/store/slices/god-slice'

const DBAL = process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'

export interface SmtpConfig {
  host: string
  port: number
  secure: boolean
  username: string
  password: string
  fromEmail: string
  fromName: string
}

/** Outbound email (SMTP) settings, persisted in Redux + published to DBAL. */
export function useSmtpConfig() {
  const dispatch = useAppDispatch()
  const config: SmtpConfig = useAppSelector(s => s.god.smtp)
  const dirty: boolean = useAppSelector(s => s.god.dirty.smtp)
  const [publishing, setPublishing] = useState(false)

  const set = useCallback(
    <K extends keyof SmtpConfig>(key: K, value: SmtpConfig[K]) => {
      dispatch(setSmtp({ ...config, [key]: value }))
    },
    [config, dispatch]
  )

  const publish = useCallback(
    async (tenant = 'system'): Promise<boolean> => {
      setPublishing(true)
      try {
        const res = await fetch(`${DBAL}/${tenant}/core/SmtpConfig`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: `smtp_${tenant}`,
            tenantId: tenant,
            ...config,
          }),
          signal: AbortSignal.timeout(6000),
        })
        if (!res.ok) return false
        dispatch(clearDirty('smtp'))
        return true
      } catch {
        return false
      } finally {
        setPublishing(false)
      }
    },
    [config, dispatch]
  )

  return { config, set, dirty, publish, publishing }
}
