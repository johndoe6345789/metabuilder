'use client'

/**
 * The tenant's stored files.
 *
 * Everything goes through /api/assets rather than the store directly: the
 * object store is not published, and its credentials are server-side only.
 */

import { useCallback, useEffect, useState } from 'react'
import { BASE_PATH } from '@/lib/app-config'

export interface Asset {
  key: string
  size: number
  etag: string
  lastModified: string
}

export const assetUrl = (tenant: string, key: string): string =>
  `${BASE_PATH}/api/assets/${encodeURI(key)}?tenant=${encodeURIComponent(tenant)}`

export function useAssets(tenant: string) {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `${BASE_PATH}/api/assets?tenant=${encodeURIComponent(tenant)}`,
        { cache: 'no-store' }
      )
      const body = (await res.json()) as { objects?: Asset[]; error?: string }
      setAssets(body.objects ?? [])
      setError(res.ok ? null : (body.error ?? 'Could not list files'))
    } catch {
      setError('Could not reach the file store')
    } finally {
      setLoading(false)
    }
  }, [tenant])

  useEffect(() => {
    void Promise.resolve().then(() => refresh())
  }, [refresh])

  const upload = useCallback(
    async (file: File): Promise<boolean> => {
      setBusy(true)
      setError(null)
      try {
        const form = new FormData()
        form.append('file', file)
        form.append('tenant', tenant)
        const res = await fetch(`${BASE_PATH}/api/assets`, {
          method: 'POST',
          body: form,
        })
        if (!res.ok) {
          const body = (await res.json()) as { error?: string }
          // The server's reason is the useful one -- wrong type, too big,
          // not signed in -- so show that rather than a generic failure.
          setError(body.error ?? `Upload failed (${res.status})`)
          return false
        }
        await refresh()
        return true
      } catch {
        setError('Upload failed')
        return false
      } finally {
        setBusy(false)
      }
    },
    [tenant, refresh]
  )

  const remove = useCallback(
    async (key: string): Promise<void> => {
      setBusy(true)
      try {
        await fetch(assetUrl(tenant, key), { method: 'DELETE' })
        await refresh()
      } finally {
        setBusy(false)
      }
    },
    [tenant, refresh]
  )

  return { assets, loading, busy, error, upload, remove, refresh }
}
