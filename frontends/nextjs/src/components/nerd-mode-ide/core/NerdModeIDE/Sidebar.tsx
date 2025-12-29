import type { FileNode } from '@/lib/nerd-mode-ide'

import { NerdModeIDEFileExplorer } from '../../components/NerdModeIDEFileExplorer'

interface SidebarProps {
  nodes: FileNode[]
  selectedFileId: string | null
  activeFolderId: string | null
  onToggleFolder: (nodeId: string) => void
  onSelectFile: (nodeId: string) => void
  onSelectFolder: (nodeId: string | null) => void
}

export function Sidebar({
  nodes,
  selectedFileId,
  activeFolderId,
  onToggleFolder,
  onSelectFile,
  onSelectFolder,
}: SidebarProps) {
  return (
    <NerdModeIDEFileExplorer
      nodes={nodes}
      selectedFileId={selectedFileId}
      activeFolderId={activeFolderId}
      onToggleFolder={onToggleFolder}
      onSelectFile={onSelectFile}
      onSelectFolder={onSelectFolder}
    />
  )
}
