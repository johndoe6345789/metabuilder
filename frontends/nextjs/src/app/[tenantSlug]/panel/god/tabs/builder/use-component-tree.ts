'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuthContext } from '@/app/_components/auth-provider/auth-provider-component'
import { normalizeTenantId } from '@/lib/tenant/workspace-paths'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setTree, type GodState } from '@/store/slices/god-slice'
import { type TreeNode } from './builder-registry'
import { getSelectedTreeNode } from './component-tree-selection'
import { findNode } from './component-tree-utils'
import { autoId } from './auto-identity'
import { useComponentTreeActions } from './component-tree-actions'
import { useComponentTreePublish } from './component-tree-publish'
import { treeBelongsToAnother, writeTreeTenant } from './tree-tenant'

const BLANK: TreeNode = { id: 'root', type: 'container', props: {}, children: [] }

/** Component-tree editor state — tree persisted in Redux (god slice). */
export function useComponentTree() {
  const dispatch = useAppDispatch()
  const stored = useAppSelector(s => (s.god as GodState).tree)
  const dirty = useAppSelector(s => (s.god as GodState).dirty.tree)
  const [selectedId, setSelectedId] = useState<string>('root')

  const auth = useAuthContext()
  const tenant = normalizeTenantId(auth.user?.tenantId)

  /**
   * Whose tree this is, answered here rather than by whichever tab asked.
   * It used to be checked in useWorkbench -- the Components tab's view
   * model -- so every other consumer skipped it. BQL was one: run from its
   * tab on a different tenant, it appended to the previous tenant's
   * leftover draft and published the result to a live route.
   *
   * Derived during render, not in an effect, so no consumer ever sees the
   * other tenant's content -- an effect would leave one render where a
   * script could read it and a page could show it.
   */
  const foreign = treeBelongsToAnother(tenant)
  const tree = foreign ? BLANK : stored

  /**
   * Edit history. Every change to the tree goes through commit(), so keeping
   * the stacks here covers adding, moving, deleting and editing properties
   * without each action having to remember to record itself.
   *
   * Refs rather than state: the stacks are read inside callbacks and their
   * depth is not worth a re-render on its own -- `canUndo` below is state,
   * and it is what the buttons actually watch.
   */
  const past = useRef<TreeNode[]>([])
  const future = useRef<TreeNode[]>([])
  const [depth, setDepth] = useState({ undo: 0, redo: 0 })
  const sync = useCallback(() => {
    setDepth({ undo: past.current.length, redo: future.current.length })
  }, [])

  const commit = useCallback(
    (next: TreeNode) => {
      past.current = [...past.current.slice(-49), tree]
      // A new edit is a new branch: whatever was undone is no longer ahead.
      future.current = []
      sync()
      dispatch(setTree(next))
    },
    [dispatch, tree, sync]
  )

  const undo = useCallback(() => {
    const previous = past.current.at(-1)
    if (previous === undefined) return
    past.current = past.current.slice(0, -1)
    future.current = [...future.current, tree]
    sync()
    dispatch(setTree(previous))
  }, [dispatch, tree, sync])

  const redo = useCallback(() => {
    const next = future.current.at(-1)
    if (next === undefined) return
    future.current = future.current.slice(0, -1)
    past.current = [...past.current, tree]
    sync()
    dispatch(setTree(next))
  }, [dispatch, tree, sync])

  /** Loading a different tree starts a new history; the old one is not ours. */
  const clearHistory = useCallback(() => {
    past.current = []
    future.current = []
    sync()
  }, [sync])
  useEffect(() => {
    if (foreign) {
      // Straight to setTree rather than through commit(): a tenant's
      // content must not sit on the undo stack, where Ctrl+Z would put it
      // back.
      dispatch(setTree(BLANK))
      clearHistory()
    }
    writeTreeTenant(tenant)
  }, [foreign, tenant, dispatch, clearHistory])

  const selected = getSelectedTreeNode(tree, selectedId)
  const { addNode, updateProps, deleteNode, moveNode } =
    useComponentTreeActions(tree, selected, commit, setSelectedId)

  /**
   * Selecting a node is also the moment its id gets backfilled if it never
   * had one -- content published before auto-identity.ts existed, or a
   * node some other client wrote directly. Computed the same way as a
   * brand-new node (see addNode) and just as stable afterward: editing the
   * text later never re-derives it, so an existing anchor or aria-reference
   * to this id can't silently break once it exists.
   */
  const selectNode = useCallback(
    (id: string) => {
      setSelectedId(id)
      const node = findNode(tree, id)
      if (node === null) return
      const hasId =
        typeof node.props.id === 'string' && node.props.id.trim() !== ''
      if (hasId) return
      const computed = autoId(node.type, node.props, tree, node.id)
      if (computed !== '') updateProps(id, { id: computed })
    },
    [tree, updateProps]
  )

  /** Start over from an empty root, for the "Blank tree" option. */
  const resetTree = useCallback(() => {
    commit({ id: 'root', type: 'container', props: {}, children: [] })
    setSelectedId('root')
  }, [commit])

  /**
   * Swap in a whole tree computed elsewhere (BQL's apply step builds one
   * from a script). Goes through the same commit() as every other edit so
   * it lands on the undo stack like anything a person does by hand.
   */
  const replaceTree = useCallback(
    (next: TreeNode) => {
      commit(next)
    },
    [commit]
  )
  const {
    publish,
    publishing,
    conflict,
    error: publishError,
    load: loadTree,
    loading,
  } = useComponentTreePublish(tree)
  const load = useCallback(
    async (tenant: string, path: string) => {
      const result = await loadTree(tenant, path)
      clearHistory()
      return result
    },
    [loadTree, clearHistory]
  )
  return {
    tree,
    selected,
    selectedId,
    setSelectedId: selectNode,
    addNode,
    updateProps,
    deleteNode,
    moveNode,
    resetTree,
    replaceTree,
    undo,
    redo,
    canUndo: depth.undo > 0,
    canRedo: depth.redo > 0,
    dirty,
    publish,
    publishing,
    conflict,
    publishError,
    load,
    loading,
  }
}
