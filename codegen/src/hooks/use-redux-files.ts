import { useAppDispatch, useAppSelector } from '@/store'
import { 
  loadFiles, 
  saveFile, 
  deleteFile, 
  setActiveFile,
  FileItem 
} from '@/store/slices/filesSlice'
import { useCallback } from 'react'

export function useReduxFiles() {
  const dispatch = useAppDispatch()
  const files = useAppSelector((state) => state.files.files)
  const activeFileId = useAppSelector((state) => state.files.activeFileId)
  const loading = useAppSelector((state) => state.files.loading)
  const error = useAppSelector((state) => state.files.error)

  const activeFile = files.find(f => f.id === activeFileId)

  const load = useCallback(() => {
    dispatch(loadFiles())
  }, [dispatch])

  const save = useCallback((file: FileItem) => {
    dispatch(saveFile(file))
  }, [dispatch])

  const remove = useCallback((fileId: string) => {
    dispatch(deleteFile(fileId))
  }, [dispatch])

  const setActive = useCallback((fileId: string) => {
    dispatch(setActiveFile(fileId))
  }, [dispatch])

  return {
    files,
    activeFile,
    activeFileId,
    loading,
    error,
    load,
    save,
    remove,
    setActive,
  }
}
