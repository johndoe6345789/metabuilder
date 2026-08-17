'use client'

/**
 * Lets a workspace page (dashboard, profile, ...) hand a section of itself
 * over to the God Panel component-tree builder. Fetches the PageConfig row
 * for `tenant`+`path` (same shape ComponentTreeTab's target picker publishes
 * to) and renders it if one exists and is published; otherwise renders
 * `children` unchanged, so nothing breaks before content is authored for a
 * given path. Client-side fetch (not fetch-tenant-page.ts's `server-only`
 * version) since workspace pages are 'use client'.
 *
 * Content is level-gated the same way the rest of the app is: via LevelGate,
 * using the row's own `level` field, NOT PageConfig's public DBAL read ACL
 * (that only controls whether the JSON is fetchable, not whether it's shown).
 */

import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { LevelGate } from '@/components/layout/LevelGate'
import { UIPageRenderer } from '@/components/ui-page-renderer/UIPageRenderer'
import type { TreeNode } from '@/components/blocks/block-registry'

const DBAL = process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'

interface SlotConfig {
  level: number
  componentTree: TreeNode
}

async function fetchSlot(tenant: string, path: string): Promise<SlotConfig | null> {
  try {
    const params = new URLSearchParams({ 'filter.path': path })
    const res = await fetch(`${DBAL}/${tenant}/core/PageConfig?${params.toString()}`, {
      signal: AbortSignal.timeout(6000),
    })
    if (!res.ok) return null
    const json = await res.json() as { data?: { data?: Record<string, unknown>[] } }
    const row = json.data?.data?.find(r => r.isPublished !== false)
    if (row === undefined) return null
    const raw = row.componentTree
    const tree: unknown = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (tree === null || typeof tree !== 'object') return null
    return {
      level: typeof row.level === 'number' ? row.level : 0,
      componentTree: tree as TreeNode,
    }
  } catch {
    return null
  }
}

interface WorkspacePageSlotProps {
  tenant?: string
  path: string
  children: ReactNode
}

export function WorkspacePageSlot({
  tenant = 'system',
  path,
  children,
}: WorkspacePageSlotProps) {
  const [slot, setSlot] = useState<SlotConfig | null | undefined>(undefined)

  useEffect(() => {
    let cancelled = false
    setSlot(undefined)
    void fetchSlot(tenant, path).then(result => {
      if (!cancelled) setSlot(result)
    })
    return () => {
      cancelled = true
    }
  }, [tenant, path])

  // undefined = still loading, null = no row published for this path yet.
  if (slot === undefined || slot === null) {
    return <>{children}</>
  }

  return (
    <LevelGate minLevel={slot.level} silent>
      <UIPageRenderer layout={slot.componentTree} />
    </LevelGate>
  )
}
