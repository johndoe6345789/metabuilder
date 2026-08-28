'use client'

import { useState, useEffect, useCallback } from 'react'

const DBAL = process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'

export interface InstalledPackage {
  id: string
  packageId: string
  tenantId: string
  installedAt: number
  version: string
  enabled: boolean
}

/**
 * DBAL answers `{ success, data: { data: [...], total } }` -- two levels,
 * not one. This unwrapped a single level, so against a real DBAL it always
 * returned an empty list and the Packages tab showed every package as
 * uninstalled. Both shapes are accepted now, plus a bare array.
 */
function extractList(raw: unknown): InstalledPackage[] {
  if (raw === null || typeof raw !== 'object') return []
  if (Array.isArray(raw)) return raw as InstalledPackage[]

  const outer = raw as Record<string, unknown>
  if (Array.isArray(outer.data)) return outer.data as InstalledPackage[]

  if (outer.data !== null && typeof outer.data === 'object') {
    const inner = outer.data as Record<string, unknown>
    if (Array.isArray(inner.data)) return inner.data as InstalledPackage[]
  }
  return []
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
        setInstalled(extractList(raw))
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
