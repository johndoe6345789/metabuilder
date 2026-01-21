import { useKV } from '@/hooks/use-kv'
import { useCallback } from 'react'
import { ProjectFile } from '@/types/project'

export function useFiles() {
  const [files, setFiles] = useKV<ProjectFile[]>('project-files', [])
  
  const addFile = useCallback((file: ProjectFile) => {
    setFiles(current => [...(current || []), file])
  }, [setFiles])
  
  const updateFile = useCallback((fileId: string, updates: Partial<ProjectFile>) => {
    setFiles(current => 
      (current || []).map(f => f.id === fileId ? { ...f, ...updates } : f)
    )
  }, [setFiles])
  
  const deleteFile = useCallback((fileId: string) => {
    setFiles(current => (current || []).filter(f => f.id !== fileId))
  }, [setFiles])
  
  const getFile = useCallback((fileId: string) => {
    return files?.find(f => f.id === fileId)
  }, [files])
  
  const updateFileContent = useCallback((fileId: string, content: string) => {
    setFiles(current =>
      (current || []).map(f => f.id === fileId ? { ...f, content } : f)
    )
  }, [setFiles])
  
  return {
    files: files || [],
    addFile,
    updateFile,
    deleteFile,
    getFile,
    updateFileContent,
  }
}
