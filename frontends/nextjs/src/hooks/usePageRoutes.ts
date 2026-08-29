'use client'

/**
 * The tenant's PageConfig rows.
 *
 * A thin naming layer over useDbalCollection: this hook exists so callers
 * say `pages` rather than `items` and do not have to know the entity name.
 */

import { useDbalCollection } from '@/lib/db/use-dbal-collection'
import type { PageRoute, PageRouteInput } from './page-route-types'

export type { PageRoute, PageRouteInput } from './page-route-types'

export function usePageRoutes(tenant = 'system') {
  const { items, loading, error, reload, create, update, remove } =
    useDbalCollection<PageRoute>({ tenant, entity: 'PageConfig' })

  return {
    pages: items,
    loading,
    error,
    reload,
    create: (data: PageRouteInput) => create(data),
    update: (id: string, data: Partial<PageRoute>) => update(id, data),
    remove,
  }
}
