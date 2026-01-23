import { useState, useCallback } from 'react'

/**
 * Email draft for composition
 */
export interface EmailDraft {
  id: string
  to: string[]
  cc?: string[]
  bcc?: string[]
  subject: string
  body: string
  htmlBody?: string
  attachments?: Array<{
    id: string
    filename: string
    mimeType: string
    size: number
  }>
  createdAt: number
  updatedAt: number
  isDraft: boolean
}

/**
 * Hook to manage email composition
 * Handles draft creation, updates, and persistence
 */
export interface UseComposeResult {
  /** Current draft being composed */
  draft: EmailDraft | null
  /** Update draft with new values */
  updateDraft: (updates: Partial<Omit<EmailDraft, 'id' | 'createdAt' | 'updatedAt'>>) => void
  /** Clear current draft */
  clearDraft: () => void
  /** Save draft to server or storage */
  saveDraft: () => Promise<void>
  /** Whether save is in progress */
  isSaving: boolean
  /** Error saving draft */
  error: Error | null
}

interface ComposeState {
  draft: EmailDraft | null
  isSaving: boolean
  error: Error | null
}

/**
 * Initializes compose hook for email drafting
 * @returns Draft management interface
 */
export function useCompose(): UseComposeResult {
  const [state, setState] = useState<ComposeState>({
    draft: null,
    isSaving: false,
    error: null,
  })

  /**
   * Create new draft or get existing
   */
  const ensureDraft = useCallback((): EmailDraft => {
    if (state.draft) return state.draft

    const newDraft: EmailDraft = {
      id: `draft_${Date.now()}`,
      to: [],
      cc: [],
      bcc: [],
      subject: '',
      body: '',
      htmlBody: '',
      attachments: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isDraft: true,
    }

    setState(prev => ({ ...prev, draft: newDraft }))
    return newDraft
  }, [state.draft])

  /**
   * Update draft content
   */
  const updateDraft = useCallback(
    (updates: Partial<Omit<EmailDraft, 'id' | 'createdAt' | 'updatedAt'>>) => {
      const draft = ensureDraft()

      setState(prev => ({
        ...prev,
        draft: {
          ...draft,
          ...updates,
          updatedAt: Date.now(),
        },
      }))
    },
    [ensureDraft]
  )

  /**
   * Clear draft
   */
  const clearDraft = useCallback(() => {
    setState(prev => ({
      ...prev,
      draft: null,
      error: null,
    }))
  }, [])

  /**
   * Save draft to server
   */
  const saveDraft = useCallback(async () => {
    if (!state.draft) return

    setState(prev => ({ ...prev, isSaving: true, error: null }))

    try {
      // Simulate API call to save draft
      await new Promise(resolve => setTimeout(resolve, 500))

      // In production, this would call:
      // POST /api/v1/{tenant}/email_client/messages (with isDraft=true)
      setState(prev => ({
        ...prev,
        isSaving: false,
        draft: prev.draft
          ? { ...prev.draft, updatedAt: Date.now() }
          : null,
      }))
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to save draft')
      setState(prev => ({
        ...prev,
        isSaving: false,
        error,
      }))
      throw error
    }
  }, [state.draft])

  return {
    draft: state.draft,
    updateDraft,
    clearDraft,
    saveDraft,
    isSaving: state.isSaving,
    error: state.error,
  }
}
