'use client'

/**
 * Lets a workspace page (dashboard, admin, ...) hand itself (or a section
 * of itself) over to a seeded PageConfig row -- either a system package's
 * `component` name (packages/{id}/page-config/page-config.json, resolved
 * via component-registry.tsx to a real React component) or a user
 * package's `componentTree` (published from the God Panel's component-tree
 * builder). `component` is tried first; `componentTree` is the fallback,
 * matching how the schema already models both on the same entity. Fetches
 * the PageConfig row for `tenant`+`path` and renders it if one exists and
 * is published; otherwise renders `children` unchanged, so nothing breaks
 * before a package's seed has landed for a given path. Client-side fetch
 * (not fetch-tenant-page.ts's `server-only` version) since workspace pages
 * are 'use client'.
 *
 * Content is level-gated the same way the rest of the app is: via LevelGate,
 * using the row's own `level` field, NOT PageConfig's public DBAL read ACL
 * (that only controls whether the JSON is fetchable, not whether it's shown).
 */

import { createElement, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { LevelGate } from '@/components/layout/LevelGate'
import { UIPageRenderer } from '@/components/ui-page-renderer/UIPageRenderer'
import type { TreeNode } from '@/components/blocks/block-registry'
import { resolveComponent } from '@/lib/packages/component-registry'

const DBAL = process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'

interface SlotConfig {
  level: number
  component: string | null
  componentTree: TreeNode | null
}

function parseTree(raw: unknown): TreeNode | null {
  try {
    const value: unknown = typeof raw === 'string' ? JSON.parse(raw) : raw
    return value !== null && typeof value === 'object' ? (value as TreeNode) : null
  } catch {
    return null
  }
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
    const component = typeof row.component === 'string' ? row.component : null
    const componentTree = parseTree(row.componentTree)
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

  // System package: a registered `component` name wins over `componentTree`
  // when both happen to be present. component-tree-publish.ts stamps every
  // user-package row's `component` field with the literal marker
  // "component_tree" (not a real registry name), so this correctly falls
  // through to the componentTree branch for those rather than matching.
  //
  // Memoized rather than resolved inline: resolveComponent always returns
  // the same reference for the same name (a static lookup table, not a
  // factory). Mounted via createElement rather than JSX (<Resolved/>)
  // because eslint's react-hooks/static-components rule flags any
  // capitalized JSX tag whose value comes from a runtime lookup, on the
  // assumption it's a fresh component *definition* (which would remount and
  // lose state every render) -- createElement is the same thing JSX compiles
  // to, so this is not a behavior change, just a way to select a component
  // dynamically without tripping a rule aimed at a different mistake.
  const Resolved = useMemo(() => resolveComponent(slot?.component ?? null), [slot?.component])

  // undefined = still loading, null = no row published for this path yet.
  if (slot === undefined || slot === null) {
    return <>{children}</>
  }

  if (Resolved !== null) {
    return (
      <LevelGate minLevel={slot.level} silent>
        {createElement(Resolved)}
      </LevelGate>
    )
  }

  if (slot.componentTree !== null) {
    return (
      <LevelGate minLevel={slot.level} silent>
        <UIPageRenderer layout={slot.componentTree} />
      </LevelGate>
    )
  }

  return <>{children}</>
}
