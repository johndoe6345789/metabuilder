'use client'

import { useCallback, useState } from 'react'
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
  const commit = useCallback(
    (next: TreeNode) => {
      dispatch(setTree(next))
    },
    [dispatch]
  )
  const selected = getSelectedTreeNode(tree, selectedId)
  const { addNode, updateProps, deleteNode, moveNode } =
    useComponentTreeActions(tree, selected, commit, setSelectedId)
  const { publish, publishing, conflict, load, loading } =
    useComponentTreePublish(tree)
  return {
    tree,
    selected,
    selectedId,
    setSelectedId,
    addNode,
    updateProps,
    deleteNode,
    moveNode,
    dirty,
    publish,
    publishing,
    conflict,
    load,
    loading,
  }
}
