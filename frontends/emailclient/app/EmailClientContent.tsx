'use client'

import React, { useState, useCallback } from 'react'
import {
  MailboxLayout,
  FolderNavigation,
  type FolderNavigationItem,
  ThreadList,
  EmailHeader,
  ComposeWindow,
} from '@metabuilder/fakemui/email'
import {
  Box,
  Typography,
  IconButton,
  Button,
} from '@metabuilder/fakemui'

// ─────────────────────────────────────────────────────────────────────────────
// Demo data — replace with useMessages/useMailboxes hooks when IMAP backend is ready
// ─────────────────────────────────────────────────────────────────────────────

const DEMO_FOLDERS: FolderNavigationItem[] = [
  { id: 'inbox', label: 'Inbox', icon: '📥', unreadCount: 3, isActive: true },
  { id: 'starred', label: 'Starred', icon: '⭐' },
  { id: 'sent', label: 'Sent', icon: '📤' },
  { id: 'drafts', label: 'Drafts', icon: '📝', unreadCount: 1 },
  { id: 'spam', label: 'Spam', icon: '⚠️' },
  { id: 'trash', label: 'Trash', icon: '🗑️' },
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
    // inbox
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
    // Mark as read
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

  // ── Sidebar ──────────────────────────────────────────────────────────────
  const sidebar = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ padding: '16px' }}>
        <Button
          variant="contained"
          onClick={() => setShowCompose(true)}
          sx={{ width: '100%', borderRadius: '24px', padding: '12px 24px', fontSize: '0.9375rem', fontWeight: 500, textTransform: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.12)' }}
        >
          ✏️ Compose
        </Button>
      </Box>
      <FolderNavigation items={folders} onNavigate={handleNavigateFolder} />
    </Box>
  )

  // ── Header ───────────────────────────────────────────────────────────────
  const header = (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '0 8px' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '24px' }}>📧</span>
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.125rem' }}>
          MetaMail
        </Typography>
      </Box>
      <Box sx={{ flex: 1, maxWidth: '680px', margin: '0 auto' }}>
        <input
          type="search"
          placeholder="Search mail"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 16px',
            borderRadius: '24px',
            border: 'none',
            backgroundColor: '#f1f3f4',
            fontSize: '0.9375rem',
            outline: 'none',
          }}
        />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <IconButton aria-label="Settings" title="Settings">
          <span style={{ fontSize: '20px' }}>⚙️</span>
        </IconButton>
        <Box sx={{
          width: '32px', height: '32px', borderRadius: '50%',
          backgroundColor: '#1976d2', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
        }}>
          U
        </Box>
      </Box>
    </Box>
  )

  // ── Main (thread list) ───────────────────────────────────────────────────
  const main = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ padding: '8px 16px', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="body2" sx={{ color: '#5f6368', fontWeight: 500, textTransform: 'capitalize' }}>
          {activeFolder} {filteredEmails.length > 0 && `(${filteredEmails.length})`}
        </Typography>
        <Typography variant="caption" sx={{ color: '#5f6368' }}>
          {filteredEmails.filter(e => !e.isRead).length} unread
        </Typography>
      </Box>
      {filteredEmails.length === 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, color: '#5f6368', gap: '8px' }}>
          <span style={{ fontSize: '48px', opacity: 0.5 }}>
            {activeFolder === 'starred' ? '⭐' : activeFolder === 'trash' ? '🗑️' : '📭'}
          </span>
          <Typography variant="body1">
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

  // ── Detail (selected email) ──────────────────────────────────────────────
  const detail = selectedEmail ? (
    <Box sx={{ height: '100%', overflow: 'auto', padding: '16px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <button
          onClick={() => setSelectedEmailId(null)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', padding: '4px' }}
          aria-label="Back to list"
        >
          ←
        </button>
        <Box sx={{ display: 'flex', gap: '4px' }}>
          <IconButton aria-label="Archive" title="Archive">
            <span style={{ fontSize: '18px' }}>📥</span>
          </IconButton>
          <IconButton aria-label="Delete" title="Delete">
            <span style={{ fontSize: '18px' }}>🗑️</span>
          </IconButton>
          <IconButton aria-label="Reply" title="Reply">
            <span style={{ fontSize: '18px' }}>↩️</span>
          </IconButton>
          <IconButton aria-label="Forward" title="Forward">
            <span style={{ fontSize: '18px' }}>↪️</span>
          </IconButton>
        </Box>
      </Box>
      <EmailHeader
        from={selectedEmail.from}
        to={selectedEmail.to || ['you@metabuilder.io']}
        cc={selectedEmail.cc}
        subject={selectedEmail.subject}
        receivedAt={selectedEmail.receivedAt}
        isStarred={selectedEmail.isStarred}
        onToggleStar={(starred) => handleToggleStar(selectedEmail.id, starred)}
      />
      <Box sx={{ marginTop: '24px', fontSize: '0.9375rem', lineHeight: 1.7, whiteSpace: 'pre-wrap', color: '#3c4043' }}>
        {selectedEmail.body}
      </Box>
      <Box sx={{ marginTop: '32px', borderTop: '1px solid #e0e0e0', paddingTop: '16px' }}>
        <Button variant="outlined" onClick={() => setShowCompose(true)} sx={{ borderRadius: '20px', textTransform: 'none' }}>
          ↩️ Reply
        </Button>
        <Button variant="outlined" onClick={() => setShowCompose(true)} sx={{ borderRadius: '20px', textTransform: 'none', marginLeft: '8px' }}>
          ↪️ Forward
        </Button>
      </Box>
    </Box>
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
