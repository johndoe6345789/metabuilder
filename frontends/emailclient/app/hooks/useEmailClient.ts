'use client'

import { useState, useCallback } from 'react'
import {
  DEMO_EMAILS,
  DEMO_FOLDERS,
} from '../data/demo-emails'

export function useEmailClient() {
  const [activeFolder, setActiveFolder] =
    useState('inbox')
  const [selectedEmailId, setSelectedEmailId] =
    useState<string | null>(null)
  const [emails, setEmails] = useState(DEMO_EMAILS)
  const [showCompose, setShowCompose] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const folders = DEMO_FOLDERS.map(f => ({
    ...f,
    isActive: f.id === activeFolder,
  }))

  const selectedEmail =
    emails.find(e => e.id === selectedEmailId) || null

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

  const unreadCount =
    filteredEmails.filter(e => !e.isRead).length

  const handleSelectEmail = useCallback(
    (emailId: string) => {
      setSelectedEmailId(emailId)
      setEmails(prev =>
        prev.map(e =>
          e.id === emailId
            ? { ...e, isRead: true }
            : e
        )
      )
    },
    []
  )

  const handleToggleRead = useCallback(
    (emailId: string, read: boolean) => {
      setEmails(prev =>
        prev.map(e =>
          e.id === emailId
            ? { ...e, isRead: read }
            : e
        )
      )
    },
    []
  )

  const handleToggleStar = useCallback(
    (emailId: string, starred: boolean) => {
      setEmails(prev =>
        prev.map(e =>
          e.id === emailId
            ? { ...e, isStarred: starred }
            : e
        )
      )
    },
    []
  )

  const handleSend = useCallback(
    (data: {
      to: string[]
      cc?: string[]
      bcc?: string[]
      subject: string
      body: string
    }) => {
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
    },
    []
  )

  const handleNavigateFolder = useCallback(
    (folderId: string) => {
      setActiveFolder(folderId)
      setSelectedEmailId(null)
    },
    []
  )

  return {
    state: {
      activeFolder,
      selectedEmailId,
      emails,
      showCompose,
      searchQuery,
      isDarkMode,
      sidebarOpen,
      folders,
      selectedEmail,
      filteredEmails,
      unreadCount,
    },
    actions: {
      setSelectedEmailId,
      setSearchQuery,
      setShowCompose,
      setIsDarkMode,
      setSidebarOpen,
      handleSelectEmail,
      handleToggleRead,
      handleToggleStar,
      handleSend,
      handleNavigateFolder,
    },
  }
}
