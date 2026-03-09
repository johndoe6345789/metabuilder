import { ProjectFile } from '@/types/project'

export function useFileFilters(files: ProjectFile[]) {
  const getOpenFiles = (activeFileId: string | null, maxOpen = 5) => {
    return files.filter((f) => f.id === activeFileId || files.length < maxOpen)
  }

  const findFileById = (fileId: string | null) => {
    if (!fileId) return null
    return files.find((f) => f.id === fileId) || null
  }

  const getFilesByLanguage = (language: string) => {
    return files.filter((f) => f.language === language)
  }

  const getFilesByPath = (pathPrefix: string) => {
    return files.filter((f) => f.path.startsWith(pathPrefix))
  }

  return {
    getOpenFiles,
    findFileById,
    getFilesByLanguage,
    getFilesByPath,
  }
}
