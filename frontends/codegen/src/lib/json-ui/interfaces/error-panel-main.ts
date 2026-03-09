import type { ProjectFile } from '@/types/project'

export interface ErrorPanelMainProps {
  files: ProjectFile[]
  onFileChange: (fileId: string, content: string) => void
  onFileSelect: (fileId: string) => void
}
