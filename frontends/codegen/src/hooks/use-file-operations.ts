import { useState } from 'react'
import { ProjectFile } from '@/types/project'

export function useFileOperations(
  files: ProjectFile[],
  setFiles: (updater: (files: ProjectFile[]) => ProjectFile[]) => void
) {
  const [activeFileId, setActiveFileId] = useState<string | null>(null)

  const handleFileChange = (fileId: string, content: string) => {
    setFiles((currentFiles) =>
      currentFiles.map((f) => (f.id === fileId ? { ...f, content } : f))
    )
  }

  const handleFileAdd = (file: ProjectFile) => {
    setFiles((currentFiles) => [...currentFiles, file])
    setActiveFileId(file.id)
  }

  const handleFileClose = (fileId: string) => {
    if (activeFileId === fileId) {
      const currentIndex = files.findIndex((f) => f.id === fileId)
      const nextFile = files[currentIndex + 1] || files[currentIndex - 1]
      setActiveFileId(nextFile?.id || null)
    }
  }

  const handleFileDelete = (fileId: string) => {
    setFiles((currentFiles) => currentFiles.filter((f) => f.id !== fileId))
    if (activeFileId === fileId) {
      setActiveFileId(null)
    }
  }

  return {
    activeFileId,
    setActiveFileId,
    handleFileChange,
    handleFileAdd,
    handleFileClose,
    handleFileDelete,
  }
}
