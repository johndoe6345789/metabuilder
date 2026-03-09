import { useAppDispatch, useAppSelector } from '@/store'
import { addFile as addFileAction, updateFile as updateFileAction, removeFile, setFiles } from '@/store/slices/filesSlice'
import { useCallback } from 'react'
import { ProjectFile } from '@/types/project'

export function useFiles() {
  const dispatch = useAppDispatch()
  const sliceFiles = useAppSelector((s) => s.files?.files ?? [])
  const files = sliceFiles as unknown as ProjectFile[]
  
  const addFile = useCallback((file: ProjectFile) => {
    dispatch(addFileAction(file as any))
  }, [dispatch])
  
  const updateFile = useCallback((fileId: string, updates: Partial<ProjectFile>) => {
    const existing = files.find(f => f.id === fileId)
    if (existing) {
      dispatch(updateFileAction({ ...existing, ...updates } as any))
    }
  }, [dispatch, files])
  
  const deleteFile = useCallback((fileId: string) => {
    dispatch(removeFile(fileId))
  }, [dispatch])
  
  const getFile = useCallback((fileId: string) => {
    return files.find(f => f.id === fileId)
  }, [files])
  
  const updateFileContent = useCallback((fileId: string, content: string) => {
    const existing = files.find(f => f.id === fileId)
    if (existing) {
      dispatch(updateFileAction({ ...existing, content } as any))
    }
  }, [dispatch, files])
  
  return {
    files,
    addFile,
    updateFile,
    deleteFile,
    getFile,
    updateFileContent,
  }
}
