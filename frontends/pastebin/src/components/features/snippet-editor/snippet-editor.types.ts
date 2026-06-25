import { InputParameter, SnippetFile } from '@/lib/types'

export interface CodeEditorSectionProps {
  code: string
  language: string
  hasPreview: boolean
  functionName: string
  inputParameters: InputParameter[]
  errors: { code?: string }
  onCodeChange: (value: string) => void
  onPreviewChange: (checked: boolean) => void
  height?: string
  files: SnippetFile[]
  activeFile: string
  onActiveFileSelect: (name: string) => void
  onFileAdd: (name: string, content?: string) => void
  onFileDelete: (name: string) => void
  onFileRename: (oldName: string, newName: string) => void
  onFileUpload: (file: File) => void
}

export interface SnippetDialogTabsProps {
  activeTab: number
  onTabChange: (tab: number) => void
  editorHeight?: string
  metadataOnly?: boolean
  title: string
  description: string
  language: string
  code: string
  hasPreview: boolean
  functionName: string
  inputParameters: InputParameter[]
  errors: { title?: string; code?: string }
  onTitleChange: (v: string) => void
  onDescriptionChange: (v: string) => void
  onLanguageChange: (v: string) => void
  onCodeChange: (v: string) => void
  onPreviewChange: (v: boolean) => void
  onFunctionNameChange: (v: string) => void
  onAddParameter: () => void
  onRemoveParameter: (i: number) => void
  onUpdateParameter: (
    i: number,
    field: keyof InputParameter,
    value: string,
  ) => void
  files: SnippetFile[]
  activeFile: string
  onActiveFileSelect: (name: string) => void
  onFileAdd: (name: string, content?: string) => void
  onFileDelete: (name: string) => void
  onFileRename: (oldName: string, newName: string) => void
  onFileUpload: (file: File) => void
}
