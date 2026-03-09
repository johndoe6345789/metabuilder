export interface CodeEditorProps {
  files?: { id: string; name: string; path: string; content: string; language: string }[]
  activeFileId?: string
  onFileChange?: (fileId: string, content: string) => void
  onFileSelect?: (fileId: string) => void
  onFileClose?: (fileId: string) => void
}
