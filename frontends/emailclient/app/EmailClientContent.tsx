'use client'

import React, { useEffect } from 'react'
import {
  MailboxLayout,
  MailboxHeader,
  MailboxSidebar,
  EmailDetail,
  ThreadList,
  ComposeWindow,
} from '@metabuilder/fakemui/email'
import { Box, Typography } from '@metabuilder/fakemui'
import { useEmailClient } from './hooks/useEmailClient'

export default function EmailClientContent() {
  const { state, actions } = useEmailClient()

  useEffect(() => {
    document.documentElement.setAttribute(
      'data-theme',
      state.isDarkMode ? 'dark' : 'light'
    )
  }, [state.isDarkMode])

  const header = (
    <MailboxHeader
      searchQuery={state.searchQuery}
      onSearchChange={actions.setSearchQuery}
      isDarkMode={state.isDarkMode}
      onToggleTheme={() => {
        actions.setIsDarkMode(prev => !prev)
        document.documentElement.setAttribute(
          'data-theme',
          state.isDarkMode ? 'light' : 'dark'
        )
      }}
      onMenuClick={() =>
        actions.setSidebarOpen(prev => !prev)
      }
      onSettingsClick={() => {}}
      onAlertsClick={() => {}}
      alertCount={state.unreadCount}
      locale="EN"
      onCycleLocale={() => {}}
    />
  )

  const sidebar = (
    <MailboxSidebar
      folders={state.folders}
      onNavigate={actions.handleNavigateFolder}
      onCompose={() => actions.setShowCompose(true)}
    />
  )

  const main = (
    <Box className="mailbox-thread-panel">
      <Box className="mailbox-thread-toolbar">
        <Typography
          variant="body2"
          className="mailbox-thread-folder-label"
        >
          {state.activeFolder
            .replace(/_/g, ' ')
            .replace(/^\w/, c => c.toUpperCase())}
          {state.filteredEmails.length > 0 &&
            ` (${state.filteredEmails.length})`}
        </Typography>
        <Typography
          variant="caption"
          className="mailbox-thread-unread-label"
        >
          {state.unreadCount} unread
        </Typography>
      </Box>
      {state.filteredEmails.length === 0 ? (
        <Box className="mailbox-empty-state">
          <span className="material-symbols-outlined mailbox-empty-icon">
            {state.activeFolder === 'inbox' || state.searchQuery
              ? 'inbox'
              : 'folder_open'}
          </span>
          <Typography variant="body2">
            {state.activeFolder === 'inbox' &&
            state.searchQuery
              ? 'No results found'
              : `No messages in ${state.activeFolder}`}
          </Typography>
        </Box>
      ) : (
        <ThreadList
          emails={state.filteredEmails}
          selectedEmailId={
            state.selectedEmailId || undefined
          }
          onSelectEmail={actions.handleSelectEmail}
          onToggleRead={actions.handleToggleRead}
          onToggleStar={actions.handleToggleStar}
        />
      )}
    </Box>
  )

  const detail = state.selectedEmail ? (
    <EmailDetail
      email={state.selectedEmail}
      onClose={() =>
        actions.setSelectedEmailId(null)
      }
      onArchive={() => {}}
      onDelete={() => {}}
      onReply={() => actions.setShowCompose(true)}
      onForward={() => actions.setShowCompose(true)}
      onToggleStar={(starred) =>
        actions.handleToggleStar(
          state.selectedEmail!.id,
          starred
        )
      }
    />
  ) : undefined

  return (
    <>
      <MailboxLayout
        header={header}
        sidebar={sidebar}
        main={main}
        detail={detail}
      />
      {state.showCompose && (
        <ComposeWindow
          onSend={actions.handleSend}
          onClose={() =>
            actions.setShowCompose(false)
          }
        />
      )}
    </>
  )
}
