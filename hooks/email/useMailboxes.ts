import { useState, useCallback, useEffect } from 'react'

/**
 * Email folder/mailbox structure
 */
export interface Folder {
  id: string
  name: string
  type: 'inbox' | 'sent' | 'drafts' | 'trash' | 'spam' | 'archive' | 'custom'
  unreadCount: number
  totalCount: number
  children?: Folder[]
}

/**
 * Hook to get folder/mailbox hierarchy
 * Manages folder structure and unread counts
 */
export interface UseMailboxesResult {
  /** Folder hierarchy */
  folders: Folder[]
  /** Whether folders are being loaded */
  loading: boolean
  /** Error loading folders */
  error: Error | null
  /** Refresh folder list */
  refresh: () => Promise<void>
  /** Update unread count for a folder */
  updateUnreadCount: (folderId: string, count: number) => void
}

interface MailboxState {
  folders: Folder[]
  loading: boolean
  error: Error | null
}

/**
 * Default folder structure for new accounts
 */
const DEFAULT_FOLDERS: Folder[] = [
  {
    id: 'inbox',
    name: 'Inbox',
    type: 'inbox',
    unreadCount: 0,
    totalCount: 0,
  },
  {
    id: 'sent',
    name: 'Sent',
    type: 'sent',
    unreadCount: 0,
    totalCount: 0,
  },
  {
    id: 'drafts',
    name: 'Drafts',
    type: 'drafts',
    unreadCount: 0,
    totalCount: 0,
  },
  {
    id: 'trash',
    name: 'Trash',
    type: 'trash',
    unreadCount: 0,
    totalCount: 0,
  },
  {
    id: 'spam',
    name: 'Spam',
    type: 'spam',
    unreadCount: 0,
    totalCount: 0,
  },
]

/**
 * Initializes mailbox hook for folder management
 * @param accountId Email account ID to load folders for
 * @returns Folder hierarchy and management interface
 */
export function useMailboxes(accountId?: string): UseMailboxesResult {
  const [state, setState] = useState<MailboxState>({
    folders: DEFAULT_FOLDERS,
    loading: false,
    error: null,
  })

  /**
   * Load mailbox folders from server
   */
  const refresh = useCallback(async () => {
    if (!accountId) {
      setState(prev => ({ ...prev, folders: DEFAULT_FOLDERS }))
      return
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      // Simulate API call to fetch folders
      await new Promise(resolve => setTimeout(resolve, 500))

      // In production, this would call: GET /api/v1/{tenant}/email_client/folders?accountId={accountId}
      setState(prev => ({
        ...prev,
        loading: false,
        folders: DEFAULT_FOLDERS,
      }))
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load mailboxes')
      setState(prev => ({
        ...prev,
        loading: false,
        error,
      }))
    }
  }, [accountId])

  /**
   * Update unread count for a folder
   */
  const updateUnreadCount = useCallback((folderId: string, count: number) => {
    setState(prev => ({
      ...prev,
      folders: prev.folders.map(folder =>
        folder.id === folderId ? { ...folder, unreadCount: count } : folder
      ),
    }))
  }, [])

  /**
   * Load folders on mount or when account changes
   */
  useEffect(() => {
    refresh()
  }, [refresh])

  return {
    folders: state.folders,
    loading: state.loading,
    error: state.error,
    refresh,
    updateUnreadCount,
  }
}
