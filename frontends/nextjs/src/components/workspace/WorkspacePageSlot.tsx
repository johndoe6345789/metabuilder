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

import { createElement, type ReactNode } from 'react'
import { LevelGate } from '@/components/layout/LevelGate'
import { UIPageRenderer } from '@/components/ui-page-renderer/UIPageRenderer'
import { useWorkspaceSlot } from './use-workspace-slot'

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
  const { slot, resolved } = useWorkspaceSlot(tenant, path)

  // Still loading. Renders nothing rather than `children`: children are the
  // fallback for "nothing is published at this path", and showing them before
  // the fetch resolves does not just flash content that is about to be
  // replaced -- it *runs their effects*. /{tenant}'s fallback redirects to the
  // panel on mount, so every visit to a tenant home page navigated away before
  // its own published tree could arrive.
  if (slot === undefined) {
    return null
  }

  // Resolved, and nothing is published for this path.
  if (slot === null) {
    return <>{children}</>
  }

  // Mounted via createElement rather than JSX (<Resolved/>) because
  // eslint's react-hooks/static-components rule flags any capitalized JSX
  // tag whose value comes from a runtime lookup, on the assumption it's a
  // fresh component *definition* (which would remount and lose state
  // every render) -- createElement is the same thing JSX compiles to, so
  // this is not a behavior change, just a way to select a component
  // dynamically without tripping a rule aimed at a different mistake.
  if (resolved !== null) {
    return (
      <LevelGate minLevel={slot.level} silent>
        {createElement(resolved)}
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
