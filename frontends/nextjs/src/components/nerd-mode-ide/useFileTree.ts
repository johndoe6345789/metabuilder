'use client'

import { useState, useCallback } from 'react'
import type { FileNode, OpenFile } from './ide-types'

const DEFAULT_TREE: FileNode[] = [
  {
    name: 'src',
    type: 'folder',
    children: [
      { name: 'workflow.json', type: 'file', language: 'json' },
      { name: 'config.json', type: 'file', language: 'json' },
      { name: 'styles.css', type: 'file', language: 'css' },
    ],
  },
]

function loadTree(): FileNode[] {
  if (typeof window === 'undefined') return DEFAULT_TREE
  try {
    const raw = window.localStorage.getItem('ide-file-tree')
    if (raw != null) return JSON.parse(raw) as FileNode[]
  } catch {
    /* ignore */
  }
  return DEFAULT_TREE
}

export function useFileTree() {
  const [tree] = useState<FileNode[]>(loadTree)
  const [openFile, setOpenFile] = useState<OpenFile | null>(null)
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(
    () => new Set(['src'])
  )

  const openFileNode = useCallback((path: string, language: string) => {
    setOpenFile({ path, language, content: '' })
  }, [])

  const toggleExpand = useCallback((path: string) => {
    setExpandedPaths(prev => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }, [])

  return { tree, openFile, expandedPaths, openFileNode, toggleExpand }
}
