'use client'

import { useCallback, useEffect, useState } from 'react'
import { idbGet, idbSet } from '@/lib/persist/idb-kv'

const KEY = 'god.smtpConfig'
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

function seed(): SmtpConfig {
  return {
    host: '', port: 587, secure: false, username: '', password: '',
    fromEmail: '', fromName: 'MetaBuilder',
  }
}

/** Outbound email (SMTP) settings, IndexedDB-staged + published to DBAL. */
export function useSmtpConfig() {
  const [config, setConfig] = useState<SmtpConfig>(seed)
  const [dirty, setDirty] = useState(false)
  const [publishing, setPublishing] = useState(false)

  useEffect(() => {
    void idbGet<SmtpConfig>(KEY).then((c) => { if (c) setConfig(c) })
  }, [])

  const set = useCallback(<K extends keyof SmtpConfig>(key: K, value: SmtpConfig[K]) => {
    setConfig((c) => {
      const next = { ...c, [key]: value }
      setDirty(true); void idbSet(KEY, next)
      return next
    })
  }, [])

  const publish = useCallback(async (tenant = 'system'): Promise<boolean> => {
    setPublishing(true)
    try {
      const res = await fetch(`${DBAL}/${tenant}/core/SmtpConfig`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId: tenant, ...config }),
        signal: AbortSignal.timeout(6000),
      })
      if (!res.ok) return false
      setDirty(false); return true
    } catch { return false } finally { setPublishing(false) }
  }, [config])

  return { config, set, dirty, publish, publishing }
}
