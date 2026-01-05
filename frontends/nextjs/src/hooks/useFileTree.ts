/**
 * useFileTree hook (stub)
 */

export interface FileNode {
  name: string
  path: string
  type: 'file' | 'directory'
  children?: FileNode[]
}

export function useFileTree(rootPath?: string) {
  // TODO: Implement useFileTree
  return {
    tree: null as FileNode | null,
    loading: false,
    error: null as Error | null,
    refresh: () => {},
  }
}
