'use client'

import type { TreeNode } from './builder-registry'

export function nid(): string {
  return `n_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
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
