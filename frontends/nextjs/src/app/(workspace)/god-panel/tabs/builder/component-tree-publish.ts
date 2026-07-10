'use client'

import { useCallback, useState } from 'react'
import { useAppDispatch } from '@/store/hooks'
import { clearDirty } from '@/store/slices/god-slice'
import { snapshot } from '@/lib/persist/versions'
import type { TreeNode } from './builder-registry'

const DBAL = process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'

export function useComponentTreePublish(tree: TreeNode) {
  const dispatch = useAppDispatch()
  const [publishing, setPublishing] = useState(false)

  const publish = useCallback(
    async (tenant = 'system', path = '/', title = 'Home'): Promise<boolean> => {
      setPublishing(true)
      try {
        const res = await fetch(`${DBAL}/${tenant}/core/PageConfig`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path,
            title,
            isActive: true,
            level: 1,
            requiresAuth: false,
            tenantId: tenant,
            componentTree: tree,
          }),
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

  return { publish, publishing }
}
