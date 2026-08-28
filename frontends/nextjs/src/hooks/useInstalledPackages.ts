'use client'

import { useState, useEffect, useCallback } from 'react'
import { readList } from '@/lib/dbal/read-list'

const DBAL = process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'

export interface InstalledPackage {
  id: string
  packageId: string
  tenantId: string
  installedAt: number
  version: string
  enabled: boolean
}

export function useInstalledPackages(tenant: string) {
  const [installed, setInstalled] = useState<InstalledPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const base = `${DBAL}/${tenant}/core/InstalledPackage`

  useEffect(() => {
    fetch(base, { signal: AbortSignal.timeout(6000) })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<unknown>
      })
      .then(raw => {
        setInstalled(readList<InstalledPackage>(raw))
        setError(null)
        setLoading(false)
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : 'Load failed')
        setLoading(false)
      })
  }, [base, tick])

  const install = useCallback(
    async (packageId: string): Promise<void> => {
      const res = await fetch(base, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId,
          tenantId: tenant,
          version: '1.0.0',
          enabled: true,
          installedAt: Date.now(),
        }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setTick(n => n + 1)
    },
    [base, tenant]
  )

  const uninstall = useCallback(
    async (id: string): Promise<void> => {
      const res = await fetch(`${base}/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setTick(n => n + 1)
    },
    [base]
  )

  const isInstalled = useCallback(
    (packageId: string): boolean =>
      installed.some(p => p.packageId === packageId && p.enabled),
    [installed]
  )

  const installedRecord = useCallback(
    (packageId: string): InstalledPackage | undefined =>
      installed.find(p => p.packageId === packageId && p.enabled),
    [installed]
  )

  return {
    installed,
    loading,
    error,
    install,
    uninstall,
    isInstalled,
    installedRecord,
  }
}
