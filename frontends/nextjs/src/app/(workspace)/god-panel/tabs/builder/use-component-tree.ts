'use client'

import { useCallback, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setTree, clearDirty } from '@/store/slices/god-slice'
import { snapshot } from '@/lib/persist/versions'
import { paletteItem, type TreeNode } from './builder-registry'
import {
  findNode,
  insertAfter,
  insertChild,
  isDescendant,
  mapTree,
  nid,
  removeNode,
  walk,
} from './component-tree-utils'

const DBAL = process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'

/** Component-tree editor state — tree persisted in Redux (god slice). */
export function useComponentTree() {
  const dispatch = useAppDispatch()
  const tree: TreeNode = useAppSelector(s => s.god.tree)
  const dirty = useAppSelector(s => s.god.dirty.tree)
  const [selectedId, setSelectedId] = useState<string>('root')
  const [publishing, setPublishing] = useState(false)

  const commit = useCallback(
    (next: TreeNode) => {
      dispatch(setTree(next))
    },
    [dispatch]
  )

  const selected = ((): TreeNode => {
    let found = tree
    walk(tree, n => {
      if (n.id === selectedId) found = n
    })
    return found
  })()

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
    [tree, selected, commit]
  )

  const updateProps = useCallback(
    (id: string, patch: Record<string, unknown>) => {
      commit(
        mapTree(tree, n =>
          n.id === id ? { ...n, props: { ...n.props, ...patch } } : n
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
    [tree, commit]
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

  const publish = useCallback(
    async (tenant = 'system', path = '/', title = 'Home'): Promise<boolean> => {
      setPublishing(true)
      try {
        const res = await fetch(`${DBAL}/${tenant}/core/PageConfig`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path,
            title,
            isActive: true,
            level: 1,
            requiresAuth: false,
            tenantId: tenant,
            componentTree: tree,
          }),
          signal: AbortSignal.timeout(6000),
        })
        if (!res.ok) return false
        await snapshot('god.componentTree', tree, 'Published page')
        dispatch(clearDirty('tree'))
        return true
      } catch {
        return false
      } finally {
        setPublishing(false)
      }
    },
    [tree, dispatch]
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
    dirty,
    publish,
    publishing,
  }
}
