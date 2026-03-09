import React from 'react'
import { Box, BoxProps, Button } from '../..'
import { useAccessible } from '../../../../hooks/useAccessible'

export interface FolderNavigationItem {
  id: string
  label: string
  icon?: string
  unreadCount?: number
  isActive?: boolean
}

export interface FolderNavigationProps extends BoxProps {
  items: FolderNavigationItem[]
  onNavigate?: (itemId: string) => void
  testId?: string
}

export const FolderNavigation = ({
  items,
  onNavigate,
  testId: customTestId,
  ...props
}: FolderNavigationProps) => {
  const accessible = useAccessible({
    feature: 'email',
    component: 'folder-nav',
    identifier: customTestId || 'folders'
  })

  return (
    <Box
      className="folder-navigation"
      {...accessible}
      {...props}
    >
      <nav className="folder-nav-list">
        {items.map((item) => (
          <Button
            key={item.id}
            variant={item.isActive ? 'primary' : 'ghost'}
            fullWidth
            className="folder-nav-item"
            onClick={() => onNavigate?.(item.id)}
          >
            {item.icon && <span className="folder-icon">{item.icon}</span>}
            <span className="folder-label">{item.label}</span>
            {item.unreadCount ? (
              <span className="unread-count">{item.unreadCount}</span>
            ) : null}
          </Button>
        ))}
      </nav>
    </Box>
  )
}
