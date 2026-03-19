import React from 'react'
import { Box, BoxProps, IconButton, Typography } from '../..'
import { useAccessible } from '../../../../hooks/useAccessible'

export interface MailboxHeaderProps extends BoxProps {
  appName?: string
  appIcon?: string
  searchQuery?: string
  onSearchChange?: (query: string) => void
  searchPlaceholder?: string
  avatarLabel?: string
  onSettingsClick?: () => void
  testId?: string
}

export const MailboxHeader = ({
  appName = 'MetaMail',
  appIcon = '📧',
  searchQuery = '',
  onSearchChange,
  searchPlaceholder = 'Search mail',
  avatarLabel = 'U',
  onSettingsClick,
  testId: customTestId,
  ...props
}: MailboxHeaderProps) => {
  const accessible = useAccessible({
    feature: 'email',
    component: 'mailbox-header',
    identifier: customTestId || 'header'
  })

  return (
    <Box className="mailbox-header-bar" {...accessible} {...props}>
      <Box className="mailbox-header-brand">
        <span className="mailbox-header-icon">{appIcon}</span>
        <Typography variant="h6" className="mailbox-header-title">
          {appName}
        </Typography>
      </Box>
      <Box className="mailbox-header-search">
        <input
          type="search"
          className="mailbox-search-input"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={e => onSearchChange?.(e.target.value)}
          aria-label={searchPlaceholder}
        />
      </Box>
      <Box className="mailbox-header-actions">
        {onSettingsClick && (
          <IconButton aria-label="Settings" title="Settings" onClick={onSettingsClick}>
            <span className="mailbox-header-action-icon">⚙️</span>
          </IconButton>
        )}
        <Box className="mailbox-header-avatar" aria-label="Account">
          {avatarLabel}
        </Box>
      </Box>
    </Box>
  )
}
