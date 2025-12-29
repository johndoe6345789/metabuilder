import { useCallback,useState } from 'react'
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
    (id: string, nodes = files): FileNode | null => {
      for (const node of nodes) {
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
      const parent = findNodeById(parentId)
      if (!parent || parent.type !== 'folder') return

      setFiles(files =>
        files.map(node => {
          if (node.id === parentId) {
            return {
              ...node,
              children: [...(node.children || []), child],
            }
          }
          if (node.children) {
            return {
              ...node,
              children:
                files.map(n =>
                  n.id === parentId ? { ...n, children: [...(n.children || []), child] } : n
                )[0]?.children || node.children,
            }
          }
          return node
        })
      )
      toast.success('Created')
    },
    [findNodeById, files]
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
