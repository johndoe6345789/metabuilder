/**
 * Hook for managing code editor state
 */
import { useState } from 'react'

export interface EditorFile {
  path: string
  content: string
  language?: string
}

export interface UseCodeEditorReturn {
  files: EditorFile[]
  currentFile: EditorFile | null
  setCurrentFile: (file: EditorFile | null) => void
  updateFile: (path: string, content: string) => void
  addFile: (file: EditorFile) => void
  removeFile: (path: string) => void
}

export function useCodeEditor(initialFiles: EditorFile[] = []): UseCodeEditorReturn {
  const [files, setFiles] = useState<EditorFile[]>(initialFiles)
  const [currentFile, setCurrentFile] = useState<EditorFile | null>(
    initialFiles.length > 0 ? initialFiles[0] : null
  )

  const updateFile = (path: string, content: string) => {
    setFiles(prev =>
      prev.map(f => (f.path === path ? { ...f, content } : f))
    )
    if (currentFile?.path === path) {
      setCurrentFile({ ...currentFile, content })
    }
  }

  const addFile = (file: EditorFile) => {
    setFiles(prev => [...prev, file])
  }

  const removeFile = (path: string) => {
    setFiles(prev => prev.filter(f => f.path !== path))
    if (currentFile?.path === path) {
      setCurrentFile(null)
    }
  }

  return {
    files,
    currentFile,
    setCurrentFile,
    updateFile,
    addFile,
    removeFile,
  }
}
