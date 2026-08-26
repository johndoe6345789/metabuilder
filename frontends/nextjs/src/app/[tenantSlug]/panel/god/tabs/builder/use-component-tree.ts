'use client'

import { useCallback, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setTree } from '@/store/slices/god-slice'
import { type TreeNode } from './builder-registry'
import { getSelectedTreeNode } from './component-tree-selection'
import { useComponentTreeActions } from './component-tree-actions'
import { useComponentTreePublish } from './component-tree-publish'

/** Component-tree editor state — tree persisted in Redux (god slice). */
export function useComponentTree() {
  const dispatch = useAppDispatch()
  const tree: TreeNode = useAppSelector(s => s.god.tree)
  const dirty = useAppSelector(s => s.god.dirty.tree)
  const [selectedId, setSelectedId] = useState<string>('root')

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
  const selected = getSelectedTreeNode(tree, selectedId)
  const { addNode, updateProps, deleteNode, moveNode } =
    useComponentTreeActions(tree, selected, commit, setSelectedId)
  /** Start over from an empty root, for the "Blank tree" option. */
  const resetTree = useCallback(() => {
    commit({ id: 'root', type: 'container', props: {}, children: [] })
    setSelectedId('root')
  }, [commit])
  const { publish, publishing, conflict, load: loadTree, loading } =
    useComponentTreePublish(tree)
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
    setSelectedId,
    addNode,
    updateProps,
    deleteNode,
    moveNode,
    resetTree,
    undo,
    redo,
    canUndo: depth.undo > 0,
    canRedo: depth.redo > 0,
    dirty,
    publish,
    publishing,
    conflict,
    load,
    loading,
  }
}
