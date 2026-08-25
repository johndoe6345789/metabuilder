'use client'

import { useCallback, useEffect, useState } from 'react'

const DBAL = process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'

export interface PageConfigRow {
  id: string
  path: string
  title: string
  /** Registered component name, or 'component_tree' for builder-authored pages. */
  component: string | null
  /** True when this row carries a tree the builder can load. */
  hasTree: boolean
  packageId: string | null
}

function toRow(raw: Record<string, unknown>): PageConfigRow | null {
  const path = typeof raw.path === 'string' ? raw.path : null
  if (path === null) return null
  const tree = raw.componentTree
  return {
    id: typeof raw.id === 'string' ? raw.id : '',
    path,
    title: typeof raw.title === 'string' ? raw.title : path,
    component: typeof raw.component === 'string' ? raw.component : null,
    hasTree: tree !== null && tree !== undefined && tree !== '',
    packageId: typeof raw.packageId === 'string' ? raw.packageId : null,
  }
}

/**
 * Every PageConfig for a tenant, for the route and tree pickers.
 *
 * Both dropdowns come from the same fetch: a "component tree" is not a
 * separate entity, it is a PageConfig row that happens to carry one. Today
 * every seeded row is backed by a registered component instead, so the tree
 * list is legitimately empty until something is published.
 */
export function usePageConfigs(tenant: string) {
  const [rows, setRows] = useState<PageConfigRow[]>([])
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`${DBAL}/${tenant}/core/PageConfig?limit=200`, {
        signal: AbortSignal.timeout(6000),
      })
      if (!res.ok) {
        setRows([])
        return
      }
      const json = (await res.json()) as {
        data?: { data?: Record<string, unknown>[] }
      }
      const parsed = (json.data?.data ?? [])
        .map(toRow)
        .filter((r): r is PageConfigRow => r !== null)
        .sort((a, b) => a.path.localeCompare(b.path))
      setRows(parsed)
    } catch {
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [tenant])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { rows, loading, refresh }
}
