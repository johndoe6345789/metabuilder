import { useCallback, useState } from 'react'
import { toast } from 'sonner'

export interface EditorFile {
  id: string
  name: string
  language: string
  content: string
  isDirty: boolean
}

/**
 * Hook to manage code editor state and operations
 * Handles file content, language detection, and dirty state
 */
export function useCodeEditor(initialFile?: EditorFile) {
  const [activeFile, setActiveFile] = useState<EditorFile | null>(initialFile || null)
  const [openTabs, setOpenTabs] = useState<EditorFile[]>(initialFile ? [initialFile] : [])

  const openFile = useCallback((file: EditorFile) => {
    setActiveFile(file)
    const existingTab = openTabs.find(t => t.id === file.id)
    if (!existingTab) {
      setOpenTabs([...openTabs, file])
    }
  }, [openTabs])

  const closeTab = useCallback((fileId: string) => {
    const newTabs = openTabs.filter(t => t.id !== fileId)
    setOpenTabs(newTabs)
    if (activeFile?.id === fileId) {
      setActiveFile(newTabs[newTabs.length - 1] || null)
    }
  }, [openTabs, activeFile])

  const updateContent = useCallback((content: string) => {
    if (!activeFile) return

    setActiveFile(prev =>
      prev ? { ...prev, content, isDirty: true } : null
    )
  }, [activeFile])

  const saveFile = useCallback(async (onSave?: (file: EditorFile) => Promise<void>) => {
    if (!activeFile) return

    try {
      await onSave?.(activeFile)
      setActiveFile(prev => (prev ? { ...prev, isDirty: false } : null))
      toast.success('File saved')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save')
    }
  }, [activeFile])

  const changeLanguage = useCallback((language: string) => {
    if (!activeFile) return
    setActiveFile(prev => (prev ? { ...prev, language } : null))
  }, [activeFile])

  return {
    activeFile,
    openTabs,
    openFile,
    closeTab,
    updateContent,
    saveFile,
    changeLanguage,
  }
}
