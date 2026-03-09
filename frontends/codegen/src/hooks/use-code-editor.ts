import { useCallback, useMemo } from 'react'

interface CodeFile {
  id: string
  name: string
  path: string
  content: string
  language: string
}

const languageMap: Record<string, string> = {
  typescript: 'typescript',
  javascript: 'javascript',
  tsx: 'typescriptreact',
  jsx: 'javascriptreact',
  css: 'css',
  scss: 'scss',
  html: 'html',
  json: 'json',
  python: 'python',
  yaml: 'yaml',
  markdown: 'markdown',
}

const extMap: Record<string, string> = {
  ts: 'typescript', tsx: 'typescriptreact',
  js: 'javascript', jsx: 'javascriptreact',
  css: 'css', scss: 'scss', html: 'html',
  json: 'json', py: 'python', yml: 'yaml', yaml: 'yaml', md: 'markdown',
}

function getLanguageFromFile(file: CodeFile): string {
  if (file.language && languageMap[file.language]) return languageMap[file.language]
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  return extMap[ext] ?? 'plaintext'
}

interface UseCodeEditorArgs {
  files: CodeFile[]
  activeFileId?: string
  onFileChange?: (fileId: string, content: string) => void
  onFileSelect?: (fileId: string) => void
  onFileClose?: (fileId: string) => void
}

export function useCodeEditor({ files = [], activeFileId, onFileChange, onFileSelect, onFileClose }: UseCodeEditorArgs) {
  const activeFile = useMemo(
    () => files.find(f => f.id === activeFileId) ?? files[0],
    [files, activeFileId]
  )

  const language = useMemo(
    () => activeFile ? getLanguageFromFile(activeFile) : 'plaintext',
    [activeFile]
  )

  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      if (activeFile && onFileChange && value !== undefined) {
        onFileChange(activeFile.id, value)
      }
    },
    [activeFile, onFileChange]
  )

  const hasFiles = files.length > 0

  const tabs = useMemo(
    () => files.map(file => ({
      id: file.id,
      name: file.name,
      isActive: file.id === activeFile?.id,
      className: file.id === activeFile?.id
        ? 'flex items-center gap-1.5 px-3 py-1.5 text-xs border-none cursor-pointer whitespace-nowrap bg-background border-b-2 border-b-primary text-primary'
        : 'flex items-center gap-1.5 px-3 py-1.5 text-xs border-none cursor-pointer whitespace-nowrap bg-transparent border-b-2 border-b-transparent text-muted-foreground hover:text-foreground',
      onSelect: () => onFileSelect?.(file.id),
      onClose: onFileClose ? () => onFileClose(file.id) : undefined,
    })),
    [files, activeFile, onFileSelect, onFileClose]
  )

  return {
    activeFile,
    language,
    hasFiles,
    tabs,
    handleEditorChange,
    editorValue: activeFile?.content ?? '',
    editorOptions: {
      minimap: { enabled: true },
      fontSize: 13,
      lineNumbers: 'on' as const,
      wordWrap: 'on' as const,
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 2,
      renderLineHighlight: 'all' as const,
      bracketPairColorization: { enabled: true },
    },
  }
}
