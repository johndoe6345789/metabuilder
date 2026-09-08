'use client'

/**
 * The tenant's PageConfig rows.
 *
 * A thin naming layer over useDbalCollection: this hook exists so callers
 * say `pages` rather than `items` and do not have to know the entity name.
 */

import { useMemo } from 'react'
import { useDbalCollection } from '@/lib/db/use-dbal-collection'
import { parsePageLevel } from '@/lib/tenant/page-level'
import type { PageRoute, PageRouteInput } from './page-route-types'

export type { PageRoute, PageRouteInput } from './page-route-types'

export function usePageRoutes(tenant = 'system') {
  const { items, loading, error, reload, create, update, remove } =
    useDbalCollection<PageRoute>({ tenant, entity: 'PageConfig' })

  // The SQLite adapter sends an "integer" column as a string, so an Admin
  // page arrived as level "3" -- the route list then had no label for it
  // and showed "L3", and any === against a number missed. The same parser
  // the server gate uses, so the list agrees with what it enforces.
  const pages = useMemo(
    () => items.map(row => ({ ...row, level: parsePageLevel(row.level) })),
    [items]
  )

  return {
    pages,
    loading,
    error,
    reload,
    create: (data: PageRouteInput) => create(data),
    update: (id: string, data: Partial<PageRoute>) => update(id, data),
    remove,
  }
}
