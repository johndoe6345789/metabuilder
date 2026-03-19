import React from 'react'
import { Box, BoxProps } from '../..'
import { MaterialIcon } from '../../../../icons/react/fakemui'
import { useAccessible } from '../../../../hooks/useAccessible'
import { FolderNavigation, type FolderNavigationItem } from '../navigation'

export interface MailboxSidebarProps extends BoxProps {
  folders: FolderNavigationItem[]
  onNavigate?: (folderId: string) => void
  onCompose?: () => void
  composeLabel?: string
  testId?: string
}

export const MailboxSidebar = ({
  folders,
  onNavigate,
  onCompose,
  composeLabel = 'Compose',
  testId: customTestId,
  ...props
}: MailboxSidebarProps) => {
  const accessible = useAccessible({
    feature: 'email',
    component: 'mailbox-sidebar',
    identifier: customTestId || 'sidebar'
  })

  return (
    <Box className="mailbox-sidebar-content" {...accessible} {...props}>
      {onCompose && (
        <Box className="mailbox-sidebar-compose">
          <button className="compose-btn" onClick={onCompose}>
            <MaterialIcon name="edit" size={20} />
            <span>{composeLabel}</span>
          </button>
        </Box>
      )}
      <FolderNavigation items={folders} onNavigate={onNavigate} />
    </Box>
  )
}
