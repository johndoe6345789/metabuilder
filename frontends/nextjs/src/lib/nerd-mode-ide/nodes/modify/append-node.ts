import type { FileNode } from './types'

export function appendNode(
  nodes: FileNode[],
  parentId: string | null,
  newNode: FileNode
): FileNode[] {
  if (!parentId) return [...nodes, newNode]

  return nodes.map(node => {
    if (node.id === parentId && node.type === 'folder') {
      const children = node.children ? [...node.children, newNode] : [newNode]
      return { ...node, children, expanded: true }
    }
    if (node.children) {
      return { ...node, children: appendNode(node.children, parentId, newNode) }
    }
    return node
  })
}
