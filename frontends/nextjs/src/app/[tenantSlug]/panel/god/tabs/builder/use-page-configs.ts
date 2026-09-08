'use client'

import { readList } from '@/lib/db/read-list'
import { useCallback, useEffect, useState } from 'react'

const DBAL = process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'

export interface PageConfigRow {
  id: string
  path: string
  title: string
  /**
   * Registered component name, or 'component_tree' for builder-authored pages.
   */
  component: string | null
  /** True when this route points at a PageTree the builder can load. */
  hasTree: boolean
  pageTreeId: string | null
  packageId: string | null
}

function toRow(raw: Record<string, unknown>): PageConfigRow | null {
  const path = typeof raw.path === 'string' ? raw.path : null
  if (path === null) return null
  const treeId = typeof raw.pageTreeId === 'string' ? raw.pageTreeId : null
  return {
    id: typeof raw.id === 'string' ? raw.id : '',
    path,
    title: typeof raw.title === 'string' ? raw.title : path,
    component: typeof raw.component === 'string' ? raw.component : null,
    hasTree: treeId !== null && treeId.length > 0,
    pageTreeId: treeId,
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
  /**
   * Set when the list could not be read at all.
   *
   * Every failure used to become an empty list, which is the same thing
   * this says when a community really has published nothing -- so during
   * an outage the route dropdown went blank and read as "nothing is
   * published", and the founder would republish over a path they believed
   * was free, taking over a page that was live.
   */
  const [unreachable, setUnreachable] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    setUnreachable(false)
    try {
      const res = await fetch(`${DBAL}/${tenant}/core/PageConfig?limit=200`, {
        signal: AbortSignal.timeout(6000),
      })
      if (!res.ok) {
        setRows([])
        setUnreachable(true)
        return
      }
      const json = (await res.json()) as {
        data?: { data?: Record<string, unknown>[] }
      }
      const parsed = readList<Record<string, unknown>>(json)
        .map(toRow)
        .filter((r): r is PageConfigRow => r !== null)
        .sort((a, b) => a.path.localeCompare(b.path))
      setRows(parsed)
    } catch {
      setRows([])
      setUnreachable(true)
    } finally {
      setLoading(false)
    }
  }, [tenant])

  useEffect(() => {
    void Promise.resolve().then(() => refresh())
  }, [refresh])

  return { rows, loading, unreachable, refresh }
}
