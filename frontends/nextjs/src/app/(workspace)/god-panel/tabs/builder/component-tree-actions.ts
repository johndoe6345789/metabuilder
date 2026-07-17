'use client'

import { useCallback } from 'react'
import type { TreeNode } from './builder-registry'
import { paletteItem } from './builder-registry'
import {
  findNode,
  insertAfter,
  insertChild,
  isDescendant,
  mapTree,
  nid,
  removeNode,
} from './component-tree-utils'
type Commit = (next: TreeNode) => void
export function useComponentTreeActions(
  tree: TreeNode,
  selected: TreeNode,
  commit: Commit,
  setSelectedId: (id: string) => void
) {
  const addNode = useCallback(
    (type: string) => {
      const item = paletteItem(type)
      if (!item) return
      const node: TreeNode = {
        id: nid(),
        type,
        props: { ...item.defaults },
        children: [],
      }
      const parent = paletteItem(selected.type)?.container
        ? selected.id
        : 'root'
      commit(insertChild(tree, parent, node))
      setSelectedId(node.id)
    },
    [tree, selected, commit, setSelectedId]
  )
  const updateProps = useCallback(
    (id: string, patch: Record<string, unknown>) => {
      commit(
        mapTree(tree, node =>
          node.id === id
            ? { ...node, props: { ...node.props, ...patch } }
            : node
        )
      )
    },
    [tree, commit]
  )
  const deleteNode = useCallback(
    (id: string) => {
      if (id === 'root') return
      commit(removeNode(tree, id))
      setSelectedId('root')
    },
    [tree, commit, setSelectedId]
  )
  const moveNode = useCallback(
    (dragId: string, targetId: string) => {
      if (dragId === 'root' || dragId === targetId) return
      if (isDescendant(tree, dragId, targetId)) return
      const dragged = findNode(tree, dragId)
      if (!dragged) return
      const without = removeNode(tree, dragId)
      const target = findNode(without, targetId)
      const asContainer = target && paletteItem(target.type)?.container
      commit(
        asContainer
          ? insertChild(without, targetId, dragged)
          : insertAfter(without, targetId, dragged)
      )
    },
    [tree, commit]
  )
  return { addNode, updateProps, deleteNode, moveNode }
}
