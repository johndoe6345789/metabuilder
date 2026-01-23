// fakemui/react/components/email/data-display/FolderTree.tsx
import React, { forwardRef, useState } from 'react'
import { Box, BoxProps, Typography } 
import { useAccessible } from '@metabuilder/fakemui/hooks'

export interface FolderNode {
  id: string
  name: string
  unreadCount?: number
  children?: FolderNode[]
  type?: 'inbox' | 'sent' | 'drafts' | 'trash' | 'custom'
}

export interface FolderTreeProps extends BoxProps {
  folders: FolderNode[]
  selectedFolderId?: string
  onSelectFolder?: (folderId: string) => void
  testId?: string
}

export const FolderTree = forwardRef<HTMLDivElement, FolderTreeProps>(
  ({ folders, selectedFolderId, onSelectFolder, testId: customTestId, ...props }, ref) => {
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
    const accessible = useAccessible({
      feature: 'email',
      component: 'folder-tree',
      identifier: customTestId || 'folders'
    })

    const toggleFolder = (folderId: string) => {
      const newExpanded = new Set(expandedFolders)
      if (newExpanded.has(folderId)) {
        newExpanded.delete(folderId)
      } else {
        newExpanded.add(folderId)
      }
      setExpandedFolders(newExpanded)
    }

    const renderFolder = (folder: FolderNode, level: number = 0) => (
      <div key={folder.id} className="folder-item" style={{ paddingLeft: `${level * 16}px` }}>
        <button
          className={`folder-btn ${selectedFolderId === folder.id ? 'folder-btn--active' : ''}`}
          onClick={() => onSelectFolder?.(folder.id)}
        >
          {folder.children && folder.children.length > 0 && (
            <span
              className="folder-expand"
              onClick={(e) => {
                e.stopPropagation()
                toggleFolder(folder.id)
              }}
            >
              {expandedFolders.has(folder.id) ? '▼' : '▶'}
            </span>
          )}
          <span className="folder-icon">📁</span>
          <Typography variant="body2">{folder.name}</Typography>
          {folder.unreadCount ? (
            <span className="unread-badge">{folder.unreadCount}</span>
          ) : null}
        </button>
        {expandedFolders.has(folder.id) && folder.children && (
          <div className="folder-children">
            {folder.children.map((child) => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    )

    return (
      <Box
        ref={ref}
        className="folder-tree"
        {...accessible}
        {...props}
      >
        {folders.map((folder) => renderFolder(folder))}
      </Box>
    )
  }
)

FolderTree.displayName = 'FolderTree'
