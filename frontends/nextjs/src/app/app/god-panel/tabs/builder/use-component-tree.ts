'use client'

import { useCallback, useEffect, useState } from 'react'
import { idbGet, idbSet } from '@/lib/persist/idb-kv'
import { paletteItem, type TreeNode } from './builder-registry'

const KEY = 'god.componentTree'
const DBAL = process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'

function nid(): string { return `n_${Date.now()}_${Math.random().toString(36).slice(2, 6)}` }

function root(): TreeNode {
  return { id: 'root', type: 'container', props: { direction: 'column', gap: 12 }, children: [] }
}

function walk(node: TreeNode, fn: (n: TreeNode) => void): void {
  fn(node); node.children.forEach((c) => { walk(c, fn) })
}

function mapTree(node: TreeNode, fn: (n: TreeNode) => TreeNode): TreeNode {
  const next = fn(node)
  return { ...next, children: next.children.map((c) => mapTree(c, fn)) }
}

function insertChild(node: TreeNode, parentId: string, child: TreeNode): TreeNode {
  return mapTree(node, (n) =>
    n.id === parentId ? { ...n, children: [...n.children, child] } : n)
}

function removeNode(node: TreeNode, id: string): TreeNode {
  return {
    ...node,
    children: node.children.filter((c) => c.id !== id).map((c) => removeNode(c, id)),
  }
}

function findNode(node: TreeNode, id: string): TreeNode | null {
  if (node.id === id) return node
  for (const c of node.children) {
    const found = findNode(c, id)
    if (found) return found
  }
  return null
}

function isDescendant(node: TreeNode, ancestorId: string, id: string): boolean {
  const anc = findNode(node, ancestorId)
  return anc ? findNode(anc, id) !== null && ancestorId !== id : false
}

function insertAfter(node: TreeNode, siblingId: string, child: TreeNode): TreeNode {
  const idx = node.children.findIndex((c) => c.id === siblingId)
  if (idx >= 0) {
    const next = [...node.children]
    next.splice(idx + 1, 0, child)
    return { ...node, children: next }
  }
  return { ...node, children: node.children.map((c) => insertAfter(c, siblingId, child)) }
}

/** Component-tree state with the same stage→publish persistence as workflows. */
export function useComponentTree() {
  const [tree, setTree] = useState<TreeNode>(root)
  const [selectedId, setSelectedId] = useState<string>('root')
  const [dirty, setDirty] = useState(false)
  const [publishing, setPublishing] = useState(false)

  useEffect(() => {
    void idbGet<TreeNode>(KEY).then((t) => { if (t) setTree(t) })
  }, [])

  const commit = useCallback((next: TreeNode) => {
    setTree(next); setDirty(true); void idbSet(KEY, next)
  }, [])

  const selected = ((): TreeNode => {
    let found = tree
    walk(tree, (n) => { if (n.id === selectedId) found = n })
    return found
  })()

  const addNode = useCallback((type: string) => {
    const item = paletteItem(type)
    if (!item) return
    const node: TreeNode = { id: nid(), type, props: { ...item.defaults }, children: [] }
    // Drop into the selected node if it's a container, else the root.
    const parent = paletteItem(selected.type)?.container ? selected.id : 'root'
    commit(insertChild(tree, parent, node))
    setSelectedId(node.id)
  }, [tree, selected, commit])

  const updateProps = useCallback((id: string, patch: Record<string, unknown>) => {
    commit(mapTree(tree, (n) => n.id === id ? { ...n, props: { ...n.props, ...patch } } : n))
  }, [tree, commit])

  const deleteNode = useCallback((id: string) => {
    if (id === 'root') return
    commit(removeNode(tree, id))
    setSelectedId('root')
  }, [tree, commit])

  // Drag a node onto a target: into it if it's a container, else after it.
  const moveNode = useCallback((dragId: string, targetId: string) => {
    if (dragId === 'root' || dragId === targetId) return
    if (isDescendant(tree, dragId, targetId)) return // no dropping into own subtree
    const dragged = findNode(tree, dragId)
    if (!dragged) return
    const without = removeNode(tree, dragId)
    const target = findNode(without, targetId)
    const asContainer = target && paletteItem(target.type)?.container
    const next = asContainer
      ? insertChild(without, targetId, dragged)
      : insertAfter(without, targetId, dragged)
    commit(next)
  }, [tree, commit])

  // Publish the tree to a route (PageConfig.componentTree row) in the DBAL.
  const publish = useCallback(async (
    tenant = 'system', path = '/', title = 'Home',
  ): Promise<boolean> => {
    setPublishing(true)
    try {
      const res = await fetch(`${DBAL}/${tenant}/core/PageConfig`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path, title, isActive: true, level: 1, requiresAuth: false,
          tenantId: tenant, componentTree: tree,
        }),
        signal: AbortSignal.timeout(6000),
      })
      if (!res.ok) return false
      setDirty(false)
      return true
    } catch {
      return false
    } finally {
      setPublishing(false)
    }
  }, [tree])

  return {
    tree, selected, selectedId, setSelectedId,
    addNode, updateProps, deleteNode, moveNode, dirty, publish, publishing,
  }
}
