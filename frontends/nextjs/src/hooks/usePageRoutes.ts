'use client'

import { useState, useEffect, useCallback } from 'react'
import { readList } from '@/lib/dbal/read-list'

const DBAL = process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'

export interface PageRoute {
  id: string
  path: string
  title: string
  description?: string | null
  level: number
  requiresAuth: boolean
  requiredRole?: string | null
  /** The PageTree this route renders, if any. */
  pageTreeId: string | null
  // Matches PageConfig's actual field name (DBAL schema) -- this was
  // "isActive" before, which isn't a real field, so every create/update
  // 422'd on "isPublished: Field is required".
  isPublished: boolean
  sortOrder: number
  tenantId?: string | null
  packageId?: string | null
}

export type PageRouteInput = Omit<PageRoute, 'id'>

export function usePageRoutes(tenant = 'system') {
  const [pages, setPages] = useState<PageRoute[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const base = `${DBAL}/${tenant}/core/PageConfig`

  const reload = useCallback(() => {
    setRefreshKey(k => k + 1)
  }, [])

  useEffect(() => {
    fetch(base, { signal: AbortSignal.timeout(8000) })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<unknown>
      })
      .then(raw => {
        setPages(readList<PageRoute>(raw))
        setError(null)
        setLoading(false)
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : 'Failed to load pages')
        setLoading(false)
      })
  }, [base, refreshKey])

  const create = useCallback(
    async (data: PageRouteInput): Promise<void> => {
      const res = await fetch(base, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const msg = await res.text().catch(() => `HTTP ${res.status}`)
        throw new Error(msg)
      }
      setRefreshKey(k => k + 1)
    },
    [base]
  )

  const update = useCallback(
    async (id: string, data: Partial<PageRoute>): Promise<void> => {
      const res = await fetch(`${base}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setRefreshKey(k => k + 1)
    },
    [base]
  )

  const remove = useCallback(
    async (id: string): Promise<void> => {
      const res = await fetch(`${base}/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setRefreshKey(k => k + 1)
    },
    [base]
  )

  return { pages, loading, error, reload, create, update, remove }
}
