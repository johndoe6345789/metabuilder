'use client'

import { useCallback, useState } from 'react'
import { useAppDispatch } from '@/store/hooks'
import { clearDirty, setTree } from '@/store/slices/god-slice'
import { snapshot } from '@/lib/persist/versions'
import type { TreeNode } from './builder-registry'

const DBAL = process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'

function pageId(tenant: string, path: string): string {
  const slug = path.replace(/^\/+/, '').replace(/[^a-z0-9]+/gi, '_')
  return `page_${tenant}_${slug.length > 0 ? slug : 'home'}`
}


interface PathOwner {
  id: string
  packageId?: string
  component?: string
}

/** The single row that owns this path, if there is one. `path` is unique. */
async function findRowForPath(
  tenant: string,
  path: string
): Promise<PathOwner | null> {
  try {
    const params = new URLSearchParams({ 'filter.path': path })
    const res = await fetch(`${DBAL}/${tenant}/core/PageConfig?${params.toString()}`, {
      signal: AbortSignal.timeout(6000),
    })
    if (!res.ok) return null
    const json = (await res.json()) as {
      data?: { data?: Record<string, unknown>[] }
    }
    const row = (json.data?.data ?? [])[0]
    if (row === undefined) return null
    return {
      id: String(row.id),
      packageId: typeof row.packageId === 'string' ? row.packageId : undefined,
      component: typeof row.component === 'string' ? row.component : undefined,
    }
  } catch {
    // Fall through to a plain create rather than blocking on a failed lookup.
    return null
  }
}

export interface PublishTarget {
  tenant: string
  path: string
  title: string
  /** 0=public, 1=user, 2=moderator, 3=admin, 4=god, 5=supergod — see ROLE_LEVELS */
  level: number
  requiresAuth: boolean
}

export const DEFAULT_PUBLISH_TARGET: PublishTarget = {
  tenant: 'system',
  path: '/',
  title: 'Home',
  level: 0,
  requiresAuth: false,
}

export function useComponentTreePublish(tree: TreeNode) {
  const dispatch = useAppDispatch()
  const [publishing, setPublishing] = useState(false)
  /** Why the last publish was refused, if it was. */
  const [conflict, setConflict] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const publish = useCallback(
    async (target: PublishTarget = DEFAULT_PUBLISH_TARGET): Promise<boolean> => {
      const { tenant, path, title, level, requiresAuth } = target
      setPublishing(true)
      try {
        // "path" carries a UNIQUE index, so a path can only ever have one
        // row. Taking a page over therefore means repointing whichever row
        // already owns the path -- posting a second one just 409s. Its id and
        // packageId are preserved, so restoring the original is a matter of
        // putting `component` back and clearing `componentTree`.
        const owner = await findRowForPath(tenant, path)
        const id = owner?.id ?? pageId(tenant, path)

        setConflict(
          owner === null || owner.component === 'component_tree'
            ? null
            : `Taking over "${path}" from ${owner.packageId ?? 'a package'} ` +
              `(was rendering "${owner.component ?? '?'}"). Restore it by ` +
              'setting that component back and clearing the tree.'
        )

        const payload = {
          id,
          path,
          title,
          packageId: owner?.packageId ?? 'god_builder',
          component: 'component_tree',
          isPublished: true,
          level,
          requiresAuth,
          sortOrder: 0,
          tenantId: tenant,
          componentTree: JSON.stringify(tree),
          updatedAt: Date.now(),
        }

        const res =
          owner === null
            ? await fetch(`${DBAL}/${tenant}/core/PageConfig`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...payload, createdAt: Date.now() }),
                signal: AbortSignal.timeout(6000),
              })
            : await fetch(`${DBAL}/${tenant}/core/PageConfig/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                signal: AbortSignal.timeout(6000),
              })
        if (!res.ok) return false
        await snapshot('god.componentTree', tree, 'Published page')
        dispatch(clearDirty('tree'))
        return true
      } catch {
        return false
      } finally {
        setPublishing(false)
      }
    },
    [tree, dispatch]
  )

  /** Loads an existing page's tree into the editor, returning its
   * level/requiresAuth too so a re-publish doesn't silently reset them to
   * DEFAULT_PUBLISH_TARGET's public/no-auth values. Null if no row exists
   * for this tenant+path yet, or the row has no parseable componentTree. */
  const load = useCallback(
    async (tenant: string, path: string): Promise<Omit<PublishTarget, 'tenant' | 'path'> | null> => {
      setLoading(true)
      try {
        const params = new URLSearchParams({ 'filter.path': path })
        const res = await fetch(`${DBAL}/${tenant}/core/PageConfig?${params.toString()}`, {
          signal: AbortSignal.timeout(6000),
        })
        if (!res.ok) return null
        const json = await res.json() as { data?: { data?: Record<string, unknown>[] } }
        const row = json.data?.data?.[0]
        if (row === undefined) return null
        const raw = row.componentTree
        const parsed: unknown = typeof raw === 'string' ? JSON.parse(raw) : raw
        if (parsed === null || typeof parsed !== 'object') return null
        dispatch(setTree(parsed as TreeNode))
        dispatch(clearDirty('tree'))
        return {
          title: typeof row.title === 'string' ? row.title : path,
          level: typeof row.level === 'number' ? row.level : 0,
          requiresAuth: typeof row.requiresAuth === 'boolean' ? row.requiresAuth : false,
        }
      } catch {
        return null
      } finally {
        setLoading(false)
      }
    },
    [dispatch]
  )

  return { publish, publishing, conflict, load, loading }
}
