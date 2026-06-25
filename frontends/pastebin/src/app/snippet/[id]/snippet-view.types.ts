export interface SnippetFile {
  name: string
  content: string
}

export interface SnippetFileTreeProps {
  files: SnippetFile[]
  activeFile: string
  langBgClass: string
  renaming: string | null
  renameValue: string
  addingFile: boolean
  newFileName: string
  menuFile: string | null
  snippetTitle: string
  newFileInputRef: React.RefObject<HTMLInputElement | null>
  onOpenInTab: (name: string) => void
  onSetRenameValue: (v: string) => void
  onRenameKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  onCommitRename: () => void
  onNewFile: () => void
  onMenuToggle: (name: string, rect: DOMRect) => void
  onNewFileNameChange: (v: string) => void
  onNewFileKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  onCommitNewFile: () => void
}
