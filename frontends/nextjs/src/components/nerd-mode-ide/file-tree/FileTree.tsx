import type { FileNode } from '@/lib/nerd-mode-ide'
import { FileTreeNode } from './FileTreeNode'

interface FileTreeProps {
  nodes: FileNode[]
  selectedFileId: string | null
  activeFolderId: string | null
  onToggleFolder: (nodeId: string) => void
  onSelectFile: (nodeId: string) => void
  onSelectFolder: (nodeId: string) => void
}

export function FileTree({
  nodes,
  selectedFileId,
  activeFolderId,
  onToggleFolder,
  onSelectFile,
  onSelectFolder,
}: FileTreeProps) {
  return (
    <div>
      {nodes.map((node) => (
        <FileTreeNode
          key={node.id}
          node={node}
          level={0}
          selectedFileId={selectedFileId}
          activeFolderId={activeFolderId}
          onToggleFolder={onToggleFolder}
          onSelectFile={onSelectFile}
          onSelectFolder={onSelectFolder}
        />
      ))}
    </div>
  )
}
