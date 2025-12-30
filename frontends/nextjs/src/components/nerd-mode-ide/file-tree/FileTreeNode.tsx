import {
  ChevronRight,
  DescriptionOutlined,
  ExpandMore,
  FolderOpenOutlined,
  FolderOutlined,
} from '@/fakemui/icons'

import type { FileNode } from '@/lib/nerd-mode-ide'

interface FileTreeNodeProps {
  node: FileNode
  level: number
  selectedFileId: string | null
  activeFolderId: string | null
  onToggleFolder: (nodeId: string) => void
  onSelectFile: (nodeId: string) => void
  onSelectFolder: (nodeId: string) => void
}

export function FileTreeNode({
  node,
  level,
  selectedFileId,
  activeFolderId,
  onToggleFolder,
  onSelectFile,
  onSelectFolder,
}: FileTreeNodeProps) {
  const isSelected = node.type === 'file' ? selectedFileId === node.id : activeFolderId === node.id
  const paddingLeft = `${level * 16}px`

  return (
    <div>
      <div
        className={`flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-accent rounded text-sm ${
          isSelected ? 'bg-accent' : ''
        }`}
        style={{ paddingLeft }}
        onClick={() => {
          if (node.type === 'folder') {
            onToggleFolder(node.id)
            onSelectFolder(node.id)
          } else {
            onSelectFile(node.id)
          }
        }}
      >
        {node.type === 'folder' ? (
          <>
            {node.expanded ? (
              <ExpandMore size={14} />
            ) : (
              <ChevronRight size={14} />
            )}
            {node.expanded ? (
              <FolderOpenOutlined size={16} />
            ) : (
              <FolderOutlined size={16} />
            )}
          </>
        ) : (
          <>
            <div style={{ width: '14px' }} />
            <DescriptionOutlined size={16} />
          </>
        )}
        <span>{node.name}</span>
      </div>
      {node.type === 'folder' && node.expanded && node.children && node.children.length > 0 && (
        <div>
          {node.children.map(child => (
            <FileTreeNode
              key={child.id}
              node={child}
              level={level + 1}
              selectedFileId={selectedFileId}
              activeFolderId={activeFolderId}
              onToggleFolder={onToggleFolder}
              onSelectFile={onSelectFile}
              onSelectFolder={onSelectFolder}
            />
          ))}
        </div>
      )}
    </div>
  )
}
