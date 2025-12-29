import { createNodeId } from './create-node-id'
import type { FileNode } from './types'

interface CreateFolderNodeOptions {
  name: string
  children?: FileNode[]
  expanded?: boolean
  exportPath?: string
}

export function createFolderNode({
  name,
  children = [],
  expanded = false,
  exportPath,
}: CreateFolderNodeOptions): FileNode {
  return {
    id: createNodeId('folder'),
    name,
    type: 'folder',
    children,
    expanded,
    exportPath,
  }
}
