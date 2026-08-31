/** Resolving what a workspace path should render, if anything. */

import { readList } from '@/lib/db/read-list'
import type { TreeNode } from '@/components/blocks/block-registry'
import { loadTree } from '@/lib/tenant/page-tree'

const DBAL = process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'

export interface SlotConfig {
  level: number
  component: string | null
  componentTree: TreeNode | null
}

/**
 * The published PageConfig for tenant+path, or null when there is nothing
 * to render (no row, unpublished, unreachable, or a row naming neither a
 * component nor a tree).
 */
export async function fetchSlot(
  tenant: string,
  path: string
): Promise<SlotConfig | null> {
  try {
    const params = new URLSearchParams({ 'filter.path': path })
    const res = await fetch(
      `${DBAL}/${tenant}/core/PageConfig?${params.toString()}`,
      { signal: AbortSignal.timeout(6000) }
    )
    if (!res.ok) return null

    const row = readList<Record<string, unknown>>(await res.json()).find(
      r => r.isPublished !== false
    )
    if (row === undefined) return null

    const component = typeof row.component === 'string' ? row.component : null
    const treeId = typeof row.pageTreeId === 'string' ? row.pageTreeId : null
    const componentTree =
      treeId === null
        ? null
        : await loadTree(DBAL, tenant, treeId)

    // Nothing this slot can actually render -- same as no row at all.
    if (component === null && componentTree === null) return null
    return {
      level: typeof row.level === 'number' ? row.level : 0,
      component,
      componentTree,
    }
  } catch {
    return null
  }
}
