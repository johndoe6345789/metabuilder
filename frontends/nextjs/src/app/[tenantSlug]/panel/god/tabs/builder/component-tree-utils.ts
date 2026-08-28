'use client'

import type { TreeNode } from './builder-registry'

/**
 * A fresh node id.
 *
 * Date.now() plus four random base36 characters is only ~1.7M combinations
 * inside a single millisecond, which is a real collision risk when nodes are
 * created in a burst (paste, import, undo-redo replay). Two nodes sharing an
 * id silently breaks selection, deletion and the duplicate-DOM-id check, so
 * a per-session counter makes it exact rather than merely unlikely.
 */
let nidCounter = 0

export function nid(): string {
  nidCounter += 1
  const random = Math.random().toString(36).slice(2, 8)
  return `n_${Date.now()}_${nidCounter.toString(36)}_${random}`
}

export function walk(node: TreeNode, fn: (n: TreeNode) => void): void {
  fn(node)
  node.children.forEach(child => {
    walk(child, fn)
  })
}

export function mapTree(
  node: TreeNode,
  fn: (n: TreeNode) => TreeNode
): TreeNode {
  const next = fn(node)
  return { ...next, children: next.children.map(child => mapTree(child, fn)) }
}

export function insertChild(
  node: TreeNode,
  parentId: string,
  child: TreeNode
): TreeNode {
  return mapTree(node, current =>
    current.id === parentId
      ? { ...current, children: [...current.children, child] }
      : current
  )
}

export function removeNode(node: TreeNode, id: string): TreeNode {
  return {
    ...node,
    children: node.children
      .filter(child => child.id !== id)
      .map(child => removeNode(child, id)),
  }
}

export function findNode(node: TreeNode, id: string): TreeNode | null {
  if (node.id === id) return node
  for (const child of node.children) {
    const found = findNode(child, id)
    if (found) return found
  }
  return null
}

export function isDescendant(
  node: TreeNode,
  ancestorId: string,
  id: string
): boolean {
  const ancestor = findNode(node, ancestorId)
  return ancestor ? findNode(ancestor, id) !== null && ancestorId !== id : false
}

export function insertAfter(
  node: TreeNode,
  siblingId: string,
  child: TreeNode
): TreeNode {
  const index = node.children.findIndex(current => current.id === siblingId)
  if (index >= 0) {
    const next = [...node.children]
    next.splice(index + 1, 0, child)
    return { ...node, children: next }
  }
  return {
    ...node,
    children: node.children.map(current =>
      insertAfter(current, siblingId, child)
    ),
  }
}

export function insertBefore(
  node: TreeNode,
  siblingId: string,
  child: TreeNode
): TreeNode {
  const index = node.children.findIndex(current => current.id === siblingId)
  if (index >= 0) {
    const next = [...node.children]
    next.splice(index, 0, child)
    return { ...node, children: next }
  }
  return {
    ...node,
    children: node.children.map(current =>
      insertBefore(current, siblingId, child)
    ),
  }
}

/**
 * The node whose children contain `id`, or null for the root / a missing id.
 */
export function parentOf(node: TreeNode, id: string): TreeNode | null {
  for (const child of node.children) {
    if (child.id === id) return node
    const found = parentOf(child, id)
    if (found !== null) return found
  }
  return null
}

/**
 * How many nodes use each DOM id, so the editor can flag a duplicate. Ids must
 * be unique in a document: a repeat silently breaks anchors and every aria
 * reference pointing at it, and nothing in the tree view would show it.
 */
export function collectDomIds(root: TreeNode): Map<string, number> {
  const counts = new Map<string, number>()
  const walk = (node: TreeNode): void => {
    const id = node.props.id
    if (typeof id === 'string' && id !== '') {
      counts.set(id, (counts.get(id) ?? 0) + 1)
    }
    node.children.forEach(walk)
  }
  walk(root)
  return counts
}
