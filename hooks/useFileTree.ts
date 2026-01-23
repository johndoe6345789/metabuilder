/**
 * useFileTree hook
 */

import { useState, useEffect, useCallback } from 'react'
import { promises as fs } from 'fs'
import path from 'path'

export interface FileNode {
  name: string
  path: string
  type: 'file' | 'directory'
  children?: FileNode[]
}

export function useFileTree(rootPath = '.') {
  const [tree, setTree] = useState<FileNode | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const buildTree = useCallback(async (dirPath: string, name: string): Promise<FileNode> => {
    const fullPath = path.resolve(rootPath, dirPath)
    const stats = await fs.stat(fullPath)

    const node: FileNode = {
      name,
      path: dirPath,
      type: stats.isDirectory() ? 'directory' : 'file',
    }

    if (stats.isDirectory()) {
      try {
        const entries = await fs.readdir(fullPath)
        node.children = await Promise.all(
          entries.map(entry => buildTree(path.join(dirPath, entry), entry))
        )
      } catch (err) {
        // Log subdirectory read errors in development for debugging
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Failed to read directory ${fullPath}:`, err)
        }
      }
    }

    return node
  }, [rootPath])

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const rootTree = await buildTree('.', path.basename(rootPath))
      setTree(rootTree)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [buildTree, rootPath])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return {
    tree,
    loading,
    error,
    refresh,
  }
}
