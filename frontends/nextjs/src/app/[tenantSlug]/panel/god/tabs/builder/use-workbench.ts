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
import { readTreeTenant } from './tree-tenant'
import type { PaneView } from './workbench/PaneTabs'

/** Every piece of state and derived value the workbench's JSX reads. */
export function useWorkbench() {
  const t = useComponentTree()
  const auth = useAuthContext()
  // The tenant is whoever is signed in -- it was never a choice to make here.
  const tenant = normalizeTenantId(auth.user?.tenantId)
  const [target, setTarget] = usePublishTarget(tenant)
  const { rows: pages, unreachable: pagesUnreachable } =
    usePageConfigs(tenant)
  const { collapsed, toggle: toggleCollapse } = useCollapsedSet()
  const targetActions = useTargetActions(t, tenant, target, pages, setTarget)
  // Greyed out only when publishing would change nothing: the tree is
  // unedited and known to be live at exactly the target path. The bar
  // used to gate on dirty alone, which load() clears, so "same tree, new
  // route" was impossible without a throwaway edit; then on a record the
  // setup panel kept, which the load on mount below never wrote. The tree
  // keeps the record now, and persists it, so a returning founder whose
  // tree was rehydrated rather than loaded is still told the truth.
  const canPublish =
    t.dirty || t.loadedPath === null || t.loadedPath !== target.path

  /**
   * Load this tenant's saved page when the signed-in tenant changes.
   *
   * Whether the tree in the store is even *ours* is no longer decided here
   * -- useComponentTree answers that for every consumer, because deciding
   * it in this one view model left BQL free to build on another tenant's
   * draft. What remains here is the useful half: fetching the page this
   * tenant actually has, if it has one.
   */
  const loadedForTenant = useRef(readTreeTenant())
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
    pagesUnreachable,
    canPublish,
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
