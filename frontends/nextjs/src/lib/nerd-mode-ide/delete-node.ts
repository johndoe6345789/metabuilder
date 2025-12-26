import type { FileNode } from './types'

export function deleteNode(nodes: FileNode[], id: string): FileNode[] {
  return nodes
    .filter((node) => node.id !== id)
    .map((node) => {
      if (!node.children) return node
      return { ...node, children: deleteNode(node.children, id) }
    })
}
