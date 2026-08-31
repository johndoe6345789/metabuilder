import { useCallback, useState } from 'react'
import type { useAppDispatch } from '@/store/hooks'
import { readOne } from '@/lib/db/read-list'
import { loadTree } from '@/lib/tenant/page-tree'
import { clearDirty, setTree } from '@/store/slices/god-slice'
import { DBAL } from './find-row-for-path'
import type { PublishTarget } from './types'

export function useLoadPage(dispatch: ReturnType<typeof useAppDispatch>) {
  const [loading, setLoading] = useState(false)

  /** Loads an existing page's tree into the editor, returning its
   * level/requiresAuth too so a re-publish doesn't silently reset them to
   * DEFAULT_PUBLISH_TARGET's public/no-auth values. Null if no row exists
   * for this tenant+path yet, or the row has no parseable componentTree. */
  const load = useCallback(
    async (
      tenant: string,
      path: string
    ): Promise<Omit<PublishTarget, 'tenant' | 'path'> | null> => {
      setLoading(true)
      try {
        const params = new URLSearchParams({ 'filter.path': path })
        const res = await fetch(
          `${DBAL}/${tenant}/core/PageConfig?${params.toString()}`,
          {
            signal: AbortSignal.timeout(6000),
          }
        )
        if (!res.ok) return null
        const json = (await res.json()) as {
          data?: { data?: Record<string, unknown>[] }
        }
        const row = readOne<Record<string, unknown>>(json)
        if (row === null) return null
        const treeId = row.pageTreeId
        if (typeof treeId !== 'string' || treeId.length === 0) return null
        const parsed = await loadTree(DBAL, tenant, treeId)
        if (parsed === null) return null
        dispatch(setTree(parsed))
        dispatch(clearDirty('tree'))
        return {
          title: typeof row.title === 'string' ? row.title : path,
          level: typeof row.level === 'number' ? row.level : 0,
          requiresAuth:
            typeof row.requiresAuth === 'boolean' ? row.requiresAuth : false,
        }
      } catch {
        return null
      } finally {
        setLoading(false)
      }
    },
    [dispatch]
  )

  return { load, loading }
}
