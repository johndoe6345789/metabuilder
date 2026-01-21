import { FolderOpen } from '@phosphor-icons/react'
import { ProjectFile } from '@/types/project'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FileExplorerDialog } from '@/components/file-explorer/FileExplorerDialog'
import { FileExplorerList } from '@/components/file-explorer/FileExplorerList'
import fileExplorerCopy from '@/data/file-explorer.json'

interface FileExplorerProps {
  files: ProjectFile[]
  activeFileId: string | null
  onFileSelect: (fileId: string) => void
  onFileAdd: (file: ProjectFile) => void
}

export function FileExplorer({
  files,
  activeFileId,
  onFileSelect,
  onFileAdd,
}: FileExplorerProps) {
  return (
    <div className="h-full flex flex-col border-r border-border bg-card">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold text-sm uppercase tracking-wide flex items-center gap-2">
          <FolderOpen size={18} weight="duotone" />
          {fileExplorerCopy.header.title}
        </h3>
        <FileExplorerDialog onFileAdd={onFileAdd} />
      </div>
      <ScrollArea className="flex-1">
        <FileExplorerList
          files={files}
          activeFileId={activeFileId}
          onFileSelect={onFileSelect}
        />
      </ScrollArea>
    </div>
  )
}
