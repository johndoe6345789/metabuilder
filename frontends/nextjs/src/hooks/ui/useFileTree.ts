import { useCallback, useState } from 'react'
import { toast } from 'sonner'

export interface FileNode {
  id: string
  name: string
  type: 'file' | 'folder'
  content?: string
  language?: string
  children?: FileNode[]
  expanded?: boolean
}

/**
 * Hook to manage file tree operations
 * Handles tree traversal, node creation, deletion, and updates
 */
export function useFileTree(initialFiles: FileNode[] = []) {
  const [files, setFiles] = useState<FileNode[]>(initialFiles)

  const findNodeById = useCallback(
    (id: string, nodes?: FileNode[]): FileNode | null => {
      const searchNodes = nodes ?? files

      for (const node of searchNodes) {
        if (node.id === id) return node
        if (node.children) {
          const found = findNodeById(id, node.children)
          if (found) return found
        }
      }
      return null
    },
    [files]
  )

  const updateNode = useCallback((id: string, updates: Partial<FileNode>) => {
    const update = (nodes: FileNode[]): FileNode[] =>
      nodes.map(node => {
        if (node.id === id) {
          return { ...node, ...updates }
        }
        if (node.children) {
          return { ...node, children: update(node.children) }
        }
        return node
      })

    setFiles(update)
  }, [])

  const deleteNode = useCallback((id: string) => {
    const remove = (nodes: FileNode[]): FileNode[] =>
      nodes
        .filter(node => node.id !== id)
        .map(node => ({
          ...node,
          children: node.children ? remove(node.children) : undefined,
        }))

    setFiles(remove)
    toast.success('Deleted')
  }, [])

  const toggleFolder = useCallback(
    (id: string) => {
      updateNode(id, { expanded: (node => !node.expanded)(findNodeById(id)!) })
    },
    [updateNode, findNodeById]
  )

  const addChild = useCallback(
    (parentId: string, child: FileNode) => {
      setFiles(currentFiles => {
        const parent = findNodeById(parentId, currentFiles)
        if (!parent || parent.type !== 'folder') return currentFiles

        const appendChild = (nodes: FileNode[]): FileNode[] =>
          nodes.map(node => {
            if (node.id === parentId && node.type === 'folder') {
              return {
                ...node,
                children: [...(node.children || []), child],
              }
            }
            if (node.children) {
              return { ...node, children: appendChild(node.children) }
            }
            return node
          })

        return appendChild(currentFiles)
      })
      toast.success('Created')
    },
    [findNodeById]
  )

  return {
    files,
    setFiles,
    findNodeById,
    updateNode,
    deleteNode,
    toggleFolder,
    addChild,
  }
}
