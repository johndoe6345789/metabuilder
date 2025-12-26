import { ScrollArea } from '@/components/ui'
import type { FileNode } from '@/lib/nerd-mode-ide'
import { FileTree } from './FileTree'

interface NerdModeIDEFileExplorerProps {
  nodes: FileNode[]
  selectedFileId: string | null
  activeFolderId: string | null
  onToggleFolder: (nodeId: string) => void
  onSelectFile: (nodeId: string) => void
  onSelectFolder: (nodeId: string) => void
}

export function NerdModeIDEFileExplorer({
  nodes,
  selectedFileId,
  activeFolderId,
  onToggleFolder,
  onSelectFile,
  onSelectFolder,
}: NerdModeIDEFileExplorerProps) {
  return (
    <div className="col-span-1 border-r border-border">
      <div className="p-2 bg-muted border-b border-border">
        <div className="text-xs font-semibold text-muted-foreground">FILE EXPLORER</div>
      </div>
      <ScrollArea className="h-[calc(100%-40px)]">
        <div className="p-2">
          <FileTree
            nodes={nodes}
            selectedFileId={selectedFileId}
            activeFolderId={activeFolderId}
            onToggleFolder={onToggleFolder}
            onSelectFile={onSelectFile}
            onSelectFolder={onSelectFolder}
          />
        </div>
      </ScrollArea>
    </div>
  )
}
