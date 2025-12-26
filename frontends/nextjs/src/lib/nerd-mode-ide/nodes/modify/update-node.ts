import type { FileNode } from './types'

export function updateNode(nodes: FileNode[], id: string, updates: Partial<FileNode>): FileNode[] {
  return nodes.map((node) => {
    if (node.id === id) {
      return { ...node, ...updates }
    }
    if (node.children) {
      return { ...node, children: updateNode(node.children, id, updates) }
    }
    return node
  })
}
