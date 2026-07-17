'use client'

import { useCallback, useState } from 'react'
import { useAppDispatch } from '@/store/hooks'
import { clearDirty } from '@/store/slices/god-slice'
import { snapshot } from '@/lib/persist/versions'
import type { TreeNode } from './builder-registry'

const DBAL = process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'

function pageId(tenant: string, path: string): string {
  const slug = path.replace(/^\/+/, '').replace(/[^a-z0-9]+/gi, '_')
  return `page_${tenant}_${slug.length > 0 ? slug : 'home'}`
}

export function useComponentTreePublish(tree: TreeNode) {
  const dispatch = useAppDispatch()
  const [publishing, setPublishing] = useState(false)

  const publish = useCallback(
    async (tenant = 'system', path = '/', title = 'Home'): Promise<boolean> => {
      setPublishing(true)
      try {
        const id = pageId(tenant, path)
        const payload = {
          id,
          path,
          title,
          packageId: 'god_builder',
          component: 'component_tree',
          isPublished: true,
          level: 1,
          requiresAuth: false,
          tenantId: tenant,
          componentTree: JSON.stringify(tree),
          updatedAt: Date.now(),
        }
        let res = await fetch(`${DBAL}/${tenant}/core/PageConfig`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, createdAt: Date.now() }),
          signal: AbortSignal.timeout(6000),
        })
        if (res.status === 409) {
          res = await fetch(`${DBAL}/${tenant}/core/PageConfig/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(6000),
          })
        }
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

  return { publish, publishing }
}
