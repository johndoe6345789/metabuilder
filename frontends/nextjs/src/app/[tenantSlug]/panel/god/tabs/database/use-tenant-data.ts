'use client'

import { useCallback, useEffect, useState } from 'react'
import { useCurrentTenantScope } from '../use-current-tenant-scope'
import { countTenantData, type CollectionCount } from './tenant-data-counts'

/** What this community holds, counted per collection. */
export function useTenantData() {
  const { tenant } = useCurrentTenantScope()
  const [counts, setCounts] = useState<CollectionCount[]>([])
  const [loading, setLoading] = useState(true)
  const [reloads, setReloads] = useState(0)

  useEffect(() => {
    let live = true
    void countTenantData(tenant).then(found => {
      if (!live) return
      setCounts(found)
      setLoading(false)
    })
    return () => {
      live = false
    }
  }, [tenant, reloads])

  return {
    tenant,
    counts,
    loading,
    /** True when nothing could be read at all -- a data layer that is
     *  down looks exactly like a community with nothing in it. */
    unreadable: counts.length > 0 && counts.every(c => c.rows === null),
    total: counts.reduce((sum, c) => sum + (c.rows ?? 0), 0),
    refresh: useCallback(() => {
      setLoading(true)
      setReloads(n => n + 1)
    }, []),
  }
}
