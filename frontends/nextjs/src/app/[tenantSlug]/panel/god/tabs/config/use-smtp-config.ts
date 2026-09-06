'use client'

import { useCallback, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setSmtp, clearDirty, type GodState } from '@/store/slices/god-slice'
import { initialState } from '@/store/slices/god-slice/initial-state'
import { useGodTenant } from '../use-god-tenant'

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
  const stored = useAppSelector(s => (s.god as GodState).smtp)
  const storedDirty = useAppSelector(s => (s.god as GodState).dirty.smtp)
  /**
   * These settings carry an outbound mail password and are published under
   * a tenant id, but persist per browser origin like the rest of the
   * slice. Without this, a founder signing in after someone else in the
   * same browser was shown that person's SMTP host, username and password.
   * Derived during render so it is never handed out, not even once.
   */
  const { foreign } = useGodTenant()
  const config = foreign ? initialState.smtp : stored
  const dirty = foreign ? false : storedDirty
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
