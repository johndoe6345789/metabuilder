import React from 'react'
import { Box, BoxProps, IconButton } from '../..'
import { MaterialIcon } from '../../../../icons/react/fakemui'
import { useAccessible } from '../../../../hooks/useAccessible'

export interface MailboxHeaderProps extends BoxProps {
  appName?: string
  searchQuery?: string
  onSearchChange?: (query: string) => void
  searchPlaceholder?: string
  avatarLabel?: string
  isDarkMode?: boolean
  onToggleTheme?: () => void
  onMenuClick?: () => void
  onSettingsClick?: () => void
  onAlertsClick?: () => void
  alertCount?: number
  locale?: string
  onCycleLocale?: () => void
  testId?: string
}

export const MailboxHeader = ({
  appName = 'MetaMail',
  searchQuery = '',
  onSearchChange,
  searchPlaceholder = 'Search mail',
  avatarLabel = 'U',
  isDarkMode = false,
  onToggleTheme,
  onMenuClick,
  onSettingsClick,
  onAlertsClick,
  alertCount = 0,
  locale = 'EN',
  onCycleLocale,
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
      <Box className="mailbox-header-left">
        {onMenuClick && (
          <IconButton aria-label="Menu" title="Menu" onClick={onMenuClick} className="mailbox-header-icon-btn">
            <MaterialIcon name="menu" size={22} />
          </IconButton>
        )}
        <Box className="mailbox-header-brand">
          <MaterialIcon name="mail" size={26} className="mailbox-header-logo" />
          <span className="mailbox-header-title">{appName}</span>
        </Box>
      </Box>

      <Box className="mailbox-header-search">
        <MaterialIcon name="search" size={20} className="mailbox-search-icon" />
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
        {onAlertsClick && (
          <Box className="mailbox-header-alert-wrapper">
            <IconButton aria-label="Notifications" title="Notifications" onClick={onAlertsClick} className="mailbox-header-icon-btn">
              <MaterialIcon name="notifications" size={20} />
            </IconButton>
            {alertCount > 0 && <span className="mailbox-header-badge">{alertCount}</span>}
          </Box>
        )}
        {onToggleTheme && (
          <IconButton
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDarkMode ? 'Light mode' : 'Dark mode'}
            onClick={onToggleTheme}
            className="mailbox-header-icon-btn"
          >
            <MaterialIcon name={isDarkMode ? 'light_mode' : 'dark_mode'} size={20} />
          </IconButton>
        )}
        {onCycleLocale && (
          <button className="mailbox-header-lang-btn" onClick={onCycleLocale} aria-label="Change language" title="Change language">
            <MaterialIcon name="language" size={16} />
            <span>{locale}</span>
          </button>
        )}
        {onSettingsClick && (
          <IconButton aria-label="Settings" title="Settings" onClick={onSettingsClick} className="mailbox-header-icon-btn">
            <MaterialIcon name="settings" size={20} />
          </IconButton>
        )}
        <Box className="mailbox-header-avatar" aria-label="Account">
          {avatarLabel}
        </Box>
      </Box>
    </Box>
  )
}
