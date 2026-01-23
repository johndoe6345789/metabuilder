import { useState, useCallback, useEffect } from 'react'

/**
 * Email message
 */
export interface Message {
  id: string
  messageId: string
  from: string
  to: string[]
  cc?: string[]
  bcc?: string[]
  replyTo?: string
  subject: string
  textBody?: string
  htmlBody?: string
  headers?: Record<string, string>
  receivedAt: number
  isRead: boolean
  isStarred: boolean
  isSpam: boolean
  isDraft: boolean
  isSent: boolean
  isDeleted: boolean
  attachmentCount: number
  conversationId?: string
  labels?: string[]
  size?: number
  createdAt: number
  updatedAt: number
}

/**
 * Hook for CRUD operations on email messages
 * Manages message list, reading, flagging, and deletion
 */
export interface UseMessagesResult {
  /** List of messages */
  messages: Message[]
  /** Whether messages are being loaded */
  loading: boolean
  /** Error loading messages */
  error: Error | null
  /** Mark message as read/unread */
  markRead: (messageId: string, isRead: boolean) => Promise<void>
  /** Mark message as spam/not spam */
  markSpam: (messageId: string, isSpam: boolean) => Promise<void>
  /** Delete message (soft delete) */
  delete: (messageId: string) => Promise<void>
  /** Star/unstar message */
  toggleStar: (messageId: string, isStarred: boolean) => Promise<void>
  /** Refresh message list */
  refresh: (folderId?: string) => Promise<void>
}

interface MessageState {
  messages: Message[]
  loading: boolean
  error: Error | null
}

/**
 * Initializes messages hook for message management
 * @param folderId Folder to load messages from
 * @returns Message list and CRUD operations
 */
export function useMessages(folderId?: string): UseMessagesResult {
  const [state, setState] = useState<MessageState>({
    messages: [],
    loading: true,
    error: null,
  })

  /**
   * Load messages from server
   */
  const refresh = useCallback(
    async (folder?: string) => {
      setState(prev => ({ ...prev, loading: true, error: null }))

      try {
        // Simulate API call to fetch messages
        await new Promise(resolve => setTimeout(resolve, 500))

        // In production, this would call:
        // GET /api/v1/{tenant}/email_client/messages?folderId={folderId}
        setState(prev => ({
          ...prev,
          loading: false,
          messages: [],
        }))
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to load messages')
        setState(prev => ({
          ...prev,
          loading: false,
          error,
        }))
      }
    },
    []
  )

  /**
   * Mark message as read/unread
   */
  const markRead = useCallback(async (messageId: string, isRead: boolean) => {
    try {
      // Simulate API call to update message
      await new Promise(resolve => setTimeout(resolve, 300))

      // In production, this would call:
      // PUT /api/v1/{tenant}/email_client/messages/{messageId}
      setState(prev => ({
        ...prev,
        messages: prev.messages.map(msg =>
          msg.id === messageId ? { ...msg, isRead } : msg
        ),
      }))
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to mark message')
      setState(prev => ({ ...prev, error }))
      throw error
    }
  }, [])

  /**
   * Mark message as spam
   */
  const markSpam = useCallback(async (messageId: string, isSpam: boolean) => {
    try {
      // Simulate API call to update message
      await new Promise(resolve => setTimeout(resolve, 300))

      // In production, this would call:
      // PUT /api/v1/{tenant}/email_client/messages/{messageId}
      setState(prev => ({
        ...prev,
        messages: prev.messages.map(msg =>
          msg.id === messageId ? { ...msg, isSpam } : msg
        ),
      }))
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to mark spam')
      setState(prev => ({ ...prev, error }))
      throw error
    }
  }, [])

  /**
   * Delete message (soft delete)
   */
  const delete_ = useCallback(async (messageId: string) => {
    try {
      // Simulate API call to delete message
      await new Promise(resolve => setTimeout(resolve, 300))

      // In production, this would call:
      // DELETE /api/v1/{tenant}/email_client/messages/{messageId}
      setState(prev => ({
        ...prev,
        messages: prev.messages.filter(msg => msg.id !== messageId),
      }))
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete message')
      setState(prev => ({ ...prev, error }))
      throw error
    }
  }, [])

  /**
   * Toggle star on message
   */
  const toggleStar = useCallback(async (messageId: string, isStarred: boolean) => {
    try {
      // Simulate API call to update message
      await new Promise(resolve => setTimeout(resolve, 300))

      // In production, this would call:
      // PUT /api/v1/{tenant}/email_client/messages/{messageId}
      setState(prev => ({
        ...prev,
        messages: prev.messages.map(msg =>
          msg.id === messageId ? { ...msg, isStarred } : msg
        ),
      }))
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to toggle star')
      setState(prev => ({ ...prev, error }))
      throw error
    }
  }, [])

  /**
   * Load messages on mount or when folder changes
   */
  useEffect(() => {
    refresh(folderId)
  }, [folderId, refresh])

  return {
    messages: state.messages,
    loading: state.loading,
    error: state.error,
    markRead,
    markSpam,
    delete: delete_,
    toggleStar,
    refresh,
  }
}
