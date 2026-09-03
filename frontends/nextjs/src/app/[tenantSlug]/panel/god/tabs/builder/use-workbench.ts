'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuthContext } from '@/app/_components/auth-provider/auth-provider-component'
import { normalizeTenantId } from '@/lib/tenant/workspace-paths'
import { useComponentTree } from './use-component-tree'
import { usePageConfigs } from './use-page-configs'
import { collectDomIds } from './component-tree-utils'
import { useCollapsedSet } from './use-collapsed-set'
import { usePublishTarget } from './use-publish-target'
import { useTargetActions } from './use-target-actions'
import { useUndoRedoKeys } from './use-undo-redo-keys'
import {
  currentTreeValue,
  hasDuplicateId,
  treesWithContent,
} from './workbench-derivations'
import type { PaneView } from './workbench/PaneTabs'

/** Every piece of state and derived value the workbench's JSX reads. */
export function useWorkbench() {
  const t = useComponentTree()
  const auth = useAuthContext()
  // The tenant is whoever is signed in -- it was never a choice to make here.
  const tenant = normalizeTenantId(auth.user?.tenantId)
  const [target, setTarget] = usePublishTarget(tenant)
  const { rows: pages } = usePageConfigs(tenant)
  const { collapsed, toggle: toggleCollapse } = useCollapsedSet()
  const targetActions = useTargetActions(t, tenant, target, pages, setTarget)

  /**
   * The draft tree persists in IndexedDB keyed by browser origin, not by
   * tenant (redux-persist has no tenant-aware key -- see the sibling redux
   * repo), so signing into a different tenant in the same browser can leave
   * a previous tenant's real page content showing under this one's URL,
   * even after a hard reload. Reload from DBAL whenever the signed-in
   * tenant actually changes -- but only then, not on every mount, so a
   * genuine unpublished draft still survives an accidental refresh for the
   * SAME tenant.
   */
  const loadedForTenant = useRef(tenant)
  const { load } = t
  useEffect(() => {
    if (loadedForTenant.current === tenant) return
    loadedForTenant.current = tenant
    void load(tenant, target.path)
  }, [tenant, target.path, load])

  // Ignored above the breakpoint, where all four panes are on screen at
  // once -- the CSS decides, so there is no width measuring here.
  const [view, setView] = useState<PaneView>('tree')
  // Narrow screens only -- above the breakpoint the setup is always shown.
  const [setupOpen, setSetupOpen] = useState(false)

  const idCounts = useMemo(() => collectDomIds(t.tree), [t.tree])
  const duplicateId = hasDuplicateId(t.selected, idCounts)

  useUndoRedoKeys(t.undo, t.redo)
  const trees = treesWithContent(pages)

  return {
    t,
    tenant,
    target,
    pages,
    collapsed,
    toggleCollapse,
    targetActions,
    view,
    setView,
    setupOpen,
    toggleSetup: () => {
      setSetupOpen(open => !open)
    },
    duplicateId,
    trees,
    currentTree: currentTreeValue(trees, target),
  }
}
