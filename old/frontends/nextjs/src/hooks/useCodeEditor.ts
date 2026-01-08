/**
 * useCodeEditor hook
 */

import { useState, useCallback, useRef } from 'react'

export interface EditorFile {
  path: string
  content: string
  language?: string
}

export function useCodeEditor() {
  const [files, setFiles] = useState<EditorFile[]>([])
  const [currentFile, setCurrentFile] = useState<EditorFile | null>(null)
  
  // Use ref to avoid stale closures in callbacks
  const currentFileRef = useRef<EditorFile | null>(null)
  currentFileRef.current = currentFile

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
    if (currentFileRef.current?.path === file.path) {
      setCurrentFile(file)
    }
  }, [])

  const closeFile = useCallback((path: string) => {
    setFiles(prev => prev.filter(f => f.path !== path))
    if (currentFileRef.current?.path === path) {
      setCurrentFile(null)
    }
  }, [])

  return {
    files,
    currentFile,
    openFile,
    saveFile,
    closeFile,
  }
}
