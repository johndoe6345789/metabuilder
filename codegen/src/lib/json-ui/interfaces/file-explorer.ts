import { ProjectFile } from '@/types/project'

export interface FileExplorerProps {
  files?: ProjectFile[]
  activeFileId?: string | null
  onFileSelect?: (fileId: string) => void
  onFileAdd?: (file: ProjectFile) => void
}
