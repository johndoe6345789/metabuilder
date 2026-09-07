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
   *
   * The publish side had the mirror of that bug: its tenant defaulted to
   * 'system' and the Config tab calls it with no argument, so a founder's
   * mail host, username and password were written into a tenant they do
   * not own -- and their own tenant never got SMTP settings at all.
   */
  const { tenant: own, foreign } = useGodTenant()
  const config = foreign ? initialState.smtp : stored
  const dirty = foreign ? false : storedDirty
  const [publishing, setPublishing] = useState(false)
  /** Why the last publish failed. The editor shows no status of its own,
   *  so without this a refused write changed nothing on screen at all. */
  const [error, setError] = useState<string | null>(null)

  const set = useCallback(
    <K extends keyof SmtpConfig>(key: K, value: SmtpConfig[K]) => {
      dispatch(setSmtp({ ...config, [key]: value }))
    },
    [config, dispatch]
  )

  const publish = useCallback(
    async (tenant = own): Promise<boolean> => {
      setPublishing(true)
      setError(null)
      try {
        const id = `smtp_${tenant}`
        const body = JSON.stringify({ id, tenantId: tenant, ...config })
        const url = `${DBAL}/${tenant}/core/SmtpConfig`
        const init = {
          headers: { 'Content-Type': 'application/json' },
          body,
          signal: AbortSignal.timeout(6000),
        }
        let res = await fetch(url, { ...init, method: 'POST' })
        // The id is fixed, so only the first publish can ever create the
        // row. Without this every later one 409s -- which is most of them,
        // and exactly the ones that matter: rotating a password, fixing a
        // wrong host.
        if (res.status === 409) {
          res = await fetch(`${url}/${id}`, { ...init, method: 'PUT' })
        }
        if (!res.ok) {
          setError('The data layer refused these settings. Nothing was saved.')
          return false
        }
        dispatch(clearDirty('smtp'))
        return true
      } catch {
        setError('Could not reach the data layer. Nothing was saved.')
        return false
      } finally {
        setPublishing(false)
      }
    },
    [config, dispatch, own]
  )

  return { config, set, dirty, error, publish, publishing }
}
