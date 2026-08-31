'use client'

import type { DropWhere } from './component-tree-drop'
import { useCallback } from 'react'
import type { TreeNode } from './builder-registry'
import { paletteItem } from './builder-registry'
import {
  findNode,
  insertAfter,
  insertBefore,
  insertChild,
  isDescendant,
  mapTree,
  nid,
  parentOf,
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
    /** `parentId` is set when a palette item is dropped onto a specific row;
     *  clicking the palette falls back to the selection as before. A drop onto
     *  a non-container lands beside it, in that node's parent, which is what
     *  dropping "on" a leaf visually implies. */
    (type: string, parentId?: string) => {
      const item = paletteItem(type)
      if (item === undefined) return
      const node: TreeNode = {
        id: nid(),
        type,
        props: { ...item.defaults },
        children: [],
      }
      let parent: string
      if (parentId === undefined) {
        parent =
          paletteItem(selected.type)?.container === true
            ? selected.id
            : 'root'
      } else {
        const target = findNode(tree, parentId)
        parent =
          target !== null && paletteItem(target.type)?.container === true
            ? parentId
            : (parentOf(tree, parentId)?.id ?? 'root')
      }
      commit(insertChild(tree, parent, node))
      setSelectedId(node.id)
    },
    [tree, selected, commit, setSelectedId]
  )
  const updateProps = useCallback(
    (id: string, patch: Record<string, unknown>) => {
      commit(
        mapTree(tree, node => {
          if (node.id !== id) return node
          const props = { ...node.props, ...patch }
          // An undefined value in the patch means "unset this", not "store
          // undefined": left in, it would be written out as an empty string
          // and the property could never go back to its default.
          for (const [key, value] of Object.entries(patch)) {
            if (value === undefined) delete props[key]
          }
          return { ...node, props }
        })
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
    /**
     * `where` says what the drop meant: onto the row (nest inside it) or
     * against its top/bottom edge (sit before or after it as a sibling).
     * Without that distinction a drop could only ever nest, so two children
     * of the same parent could not be put in a different order.
     */
    (dragId: string, targetId: string, where: DropWhere = 'into') => {
      if (dragId === 'root' || dragId === targetId) return
      if (isDescendant(tree, dragId, targetId)) return
      const dragged = findNode(tree, dragId)
      if (dragged === null) return
      const without = removeNode(tree, dragId)
      const target = findNode(without, targetId)
      if (target === null) return

      if (where === 'before') {
        commit(insertBefore(without, targetId, dragged))
        return
      }
      if (where === 'after') {
        commit(insertAfter(without, targetId, dragged))
        return
      }
      // Dropped on the row itself: nest it if that can hold children, and
      // otherwise land beside it, which is what dropping "on" a leaf implies.
      commit(
        paletteItem(target.type)?.container === true
          ? insertChild(without, targetId, dragged)
          : insertAfter(without, targetId, dragged)
      )
    },
    [tree, commit]
  )
  return { addNode, updateProps, deleteNode, moveNode }
}
