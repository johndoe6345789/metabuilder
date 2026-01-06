/**
 * useCodeEditor hook
 */

import { useState, useCallback } from 'react'

export interface EditorFile {
  path: string
  content: string
  language?: string
}

export function useCodeEditor() {
  const [files, setFiles] = useState<EditorFile[]>([])
  const [currentFile, setCurrentFile] = useState<EditorFile | null>(null)

  const openFile = useCallback((file: EditorFile) => {
    setFiles(prev => {
      const existing = prev.find(f => f.path === file.path)
      if (existing) {
        setCurrentFile(existing)
        return prev
      }
      const newFiles = [...prev, file]
      setCurrentFile(file)
      return newFiles
    })
  }, [])

  const saveFile = useCallback((file: EditorFile) => {
    setFiles(prev => prev.map(f => f.path === file.path ? file : f))
    if (currentFile?.path === file.path) {
      setCurrentFile(file)
    }
  }, [currentFile])

  const closeFile = useCallback((path: string) => {
    setFiles(prev => prev.filter(f => f.path !== path))
    if (currentFile?.path === path) {
      setCurrentFile(null)
    }
  }, [currentFile])

  return {
    files,
    currentFile,
    openFile,
    saveFile,
    closeFile,
  }
}
