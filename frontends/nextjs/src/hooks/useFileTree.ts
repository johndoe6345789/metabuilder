/**
 * Hook for managing file tree state
 */
import { useState } from 'react'

export interface FileNode {
  path: string
  name: string
  type: 'file' | 'directory'
  children?: FileNode[]
  content?: string
}

export interface UseFileTreeReturn {
  tree: FileNode[]
  expandedPaths: Set<string>
  selectedPath: string | null
  toggleExpanded: (path: string) => void
  selectPath: (path: string) => void
  setTree: (tree: FileNode[]) => void
}

export function useFileTree(initialTree: FileNode[] = []): UseFileTreeReturn {
  const [tree, setTree] = useState<FileNode[]>(initialTree)
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set())
  const [selectedPath, setSelectedPath] = useState<string | null>(null)

  const toggleExpanded = (path: string) => {
    setExpandedPaths(prev => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }

  const selectPath = (path: string) => {
    setSelectedPath(path)
  }

  return {
    tree,
    expandedPaths,
    selectedPath,
    toggleExpanded,
    selectPath,
    setTree,
  }
}
