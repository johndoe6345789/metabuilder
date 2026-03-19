'use client'

import React, { useState, useCallback } from 'react'
import {
  MailboxLayout,
  MailboxHeader,
  MailboxSidebar,
  EmailDetail,
  type FolderNavigationItem,
  ThreadList,
  ComposeWindow,
} from '@metabuilder/fakemui/email'
import { Box, Typography } from '@metabuilder/fakemui'

// ─────────────────────────────────────────────────────────────────────────────
// Demo data — replace with useMessages/useMailboxes hooks when IMAP backend is ready
// ─────────────────────────────────────────────────────────────────────────────

const DEMO_FOLDERS: FolderNavigationItem[] = [
  { id: 'inbox', label: 'Inbox', icon: 'inbox', unreadCount: 3, isActive: true },
  { id: 'starred', label: 'Starred', icon: 'star' },
  { id: 'sent', label: 'Sent', icon: 'send' },
  { id: 'drafts', label: 'Drafts', icon: 'drafts', unreadCount: 1 },
  { id: 'spam', label: 'Spam', icon: 'report' },
  { id: 'trash', label: 'Trash', icon: 'delete' },
]

const now = Date.now()
const hour = 3600000
const day = 86400000

const DEMO_EMAILS = [
  {
    id: '1',
    testId: '1',
    from: 'Alice Chen',
    to: ['you@metabuilder.io'],
    subject: 'Sprint planning for next week',
    preview: 'Hey team, I\'ve put together the backlog items we need to discuss in our sprint planning session...',
    receivedAt: now - 2 * hour,
    isRead: false,
    isStarred: true,
    body: 'Hey team,\n\nI\'ve put together the backlog items we need to discuss in our sprint planning session on Monday. Please review the board before the meeting.\n\nKey items:\n- DBAL multi-adapter support\n- Email client backend integration\n- Workflow engine performance improvements\n\nLet me know if you have anything to add.\n\nBest,\nAlice',
  },
  {
    id: '2',
    testId: '2',
    from: 'GitHub',
    to: ['you@metabuilder.io'],
    subject: '[metabuilder] PR #847: Fix loadFromDirectory tenantId auto-add',
    preview: 'mergify[bot] merged pull request #847. loadFromDirectory() was missing the tenantId field...',
    receivedAt: now - 5 * hour,
    isRead: false,
    isStarred: false,
    body: 'mergify[bot] merged pull request #847.\n\nloadFromDirectory() was missing the tenantId field auto-add logic that loadFromFile() already had, causing "Unknown field: tenantId" on all entities using the shorthand convention.\n\nFiles changed: 2\nAdditions: 51\nDeletions: 22',
  },
  {
    id: '3',
    testId: '3',
    from: 'Bob Martinez',
    to: ['you@metabuilder.io'],
    cc: ['alice@metabuilder.io'],
    subject: 'Re: Database adapter benchmarks',
    preview: 'The PostgreSQL adapter is showing 3x throughput improvement with the new connection pool settings...',
    receivedAt: now - 1 * day,
    isRead: false,
    isStarred: false,
    body: 'The PostgreSQL adapter is showing 3x throughput improvement with the new connection pool settings. Here are the results:\n\n- SQLite: 12,400 ops/sec (dev baseline)\n- PostgreSQL: 8,900 ops/sec → 26,700 ops/sec\n- MySQL: 7,200 ops/sec (unchanged)\n\nI\'ll push the config changes to the deployment branch.\n\nBob',
  },
  {
    id: '4',
    testId: '4',
    from: 'Docker Hub',
    to: ['you@metabuilder.io'],
    subject: 'Build succeeded: metabuilder/dbal:latest',
    preview: 'Your automated build for metabuilder/dbal has completed successfully. Image size: 487MB...',
    receivedAt: now - 1 * day - 3 * hour,
    isRead: true,
    isStarred: false,
    body: 'Your automated build for metabuilder/dbal has completed successfully.\n\nImage: metabuilder/dbal:latest\nSize: 487MB\nBuild time: 4m 23s\nLayers: 12',
  },
  {
    id: '5',
    testId: '5',
    from: 'Carol Wu',
    to: ['you@metabuilder.io'],
    subject: 'FakeMUI component audit results',
    preview: 'Finished the component audit — 167 components across 11 categories. All tests passing...',
    receivedAt: now - 2 * day,
    isRead: true,
    isStarred: true,
    body: 'Finished the component audit — 167 components across 11 categories. All tests passing.\n\nBreakdown:\n- Core React: 145 components\n- Email: 22 components\n- Icons: 421\n- SCSS modules: 78\n\nThe QML ports are at 104 components. Python bindings cover 15 of the most-used ones.\n\nCarol',
  },
  {
    id: '6',
    testId: '6',
    from: 'Sentry',
    to: ['you@metabuilder.io'],
    subject: 'New issue: DBAL fetch failed: 422 Unprocessable Entity',
    preview: 'A new error was detected in codegen-frontend. fetchFromDBAL threw an error for unknown entity...',
    receivedAt: now - 3 * day,
    isRead: true,
    isStarred: false,
    body: 'A new error was detected in codegen-frontend.\n\nError: DBAL fetch failed: 422 Unprocessable Entity\nFile: src/store/middleware/dbalSync.ts:131\nOccurrences: 47\nUsers affected: 3\n\nStack trace:\nfetchFromDBAL @ dbalSync.ts:131\nloadSettings @ layout.tsx:33',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Email Client App
// ─────────────────────────────────────────────────────────────────────────────

export default function EmailClientContent() {
  const [activeFolder, setActiveFolder] = useState('inbox')
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null)
  const [emails, setEmails] = useState(DEMO_EMAILS)
  const [showCompose, setShowCompose] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const folders = DEMO_FOLDERS.map(f => ({
    ...f,
    isActive: f.id === activeFolder,
  }))

  const selectedEmail = emails.find(e => e.id === selectedEmailId) || null

  const filteredEmails = emails.filter(e => {
    if (activeFolder === 'starred') return e.isStarred
    if (activeFolder === 'sent') return false
    if (activeFolder === 'drafts') return false
    if (activeFolder === 'spam') return false
    if (activeFolder === 'trash') return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        e.from.toLowerCase().includes(q) ||
        e.subject.toLowerCase().includes(q) ||
        e.preview.toLowerCase().includes(q)
      )
    }
    return true
  })

  const handleSelectEmail = useCallback((emailId: string) => {
    setSelectedEmailId(emailId)
    setEmails(prev => prev.map(e => e.id === emailId ? { ...e, isRead: true } : e))
  }, [])

  const handleToggleRead = useCallback((emailId: string, read: boolean) => {
    setEmails(prev => prev.map(e => e.id === emailId ? { ...e, isRead: read } : e))
  }, [])

  const handleToggleStar = useCallback((emailId: string, starred: boolean) => {
    setEmails(prev => prev.map(e => e.id === emailId ? { ...e, isStarred: starred } : e))
  }, [])

  const handleSend = useCallback((data: { to: string[]; cc?: string[]; bcc?: string[]; subject: string; body: string }) => {
    const newEmail = {
      id: String(Date.now()),
      testId: String(Date.now()),
      from: 'You',
      to: data.to,
      subject: data.subject,
      preview: data.body.slice(0, 100),
      receivedAt: Date.now(),
      isRead: true,
      isStarred: false,
      body: data.body,
    }
    setEmails(prev => [newEmail, ...prev])
    setShowCompose(false)
  }, [])

  const handleNavigateFolder = useCallback((folderId: string) => {
    setActiveFolder(folderId)
    setSelectedEmailId(null)
  }, [])

  const unreadCount = filteredEmails.filter(e => !e.isRead).length

  const header = (
    <MailboxHeader
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      isDarkMode={isDarkMode}
      onToggleTheme={() => {
        setIsDarkMode(prev => !prev)
        document.documentElement.setAttribute('data-theme', isDarkMode ? 'light' : 'dark')
      }}
      onMenuClick={() => setSidebarOpen(prev => !prev)}
      onSettingsClick={() => {}}
      onAlertsClick={() => {}}
      alertCount={unreadCount}
      locale="EN"
      onCycleLocale={() => {}}
    />
  )

  const sidebar = (
    <MailboxSidebar
      folders={folders}
      onNavigate={handleNavigateFolder}
      onCompose={() => setShowCompose(true)}
    />
  )

  const main = (
    <Box className="mailbox-thread-panel">
      <Box className="mailbox-thread-toolbar">
        <Typography variant="body2" className="mailbox-thread-folder-label">
          {activeFolder} {filteredEmails.length > 0 && `(${filteredEmails.length})`}
        </Typography>
        <Typography variant="caption" className="mailbox-thread-unread-label">
          {unreadCount} unread
        </Typography>
      </Box>
      {filteredEmails.length === 0 ? (
        <Box className="mailbox-empty-state">
          <span className="mailbox-empty-icon">
            {activeFolder === 'starred' ? '⭐' : activeFolder === 'trash' ? '🗑️' : '📭'}
          </span>
          <Typography variant="body2">
            {activeFolder === 'inbox' && searchQuery ? 'No results found' : `No messages in ${activeFolder}`}
          </Typography>
        </Box>
      ) : (
        <ThreadList
          emails={filteredEmails}
          selectedEmailId={selectedEmailId || undefined}
          onSelectEmail={handleSelectEmail}
          onToggleRead={handleToggleRead}
          onToggleStar={handleToggleStar}
        />
      )}
    </Box>
  )

  const detail = selectedEmail ? (
    <EmailDetail
      email={selectedEmail}
      onClose={() => setSelectedEmailId(null)}
      onArchive={() => {}}
      onDelete={() => {}}
      onReply={() => setShowCompose(true)}
      onForward={() => setShowCompose(true)}
      onToggleStar={(starred) => handleToggleStar(selectedEmail.id, starred)}
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
      {showCompose && (
        <ComposeWindow
          onSend={handleSend}
          onClose={() => setShowCompose(false)}
        />
      )}
    </>
  )
}
