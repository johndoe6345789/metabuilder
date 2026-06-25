/**
 * Redux Slice for Email Compose/Draft State Management
 * Handles draft creation, editing, and storage
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

export interface EmailDraft {
  id: string
  to: string[]
  cc: string[]
  bcc: string[]
  subject: string
  textBody: string
  htmlBody?: string
  isDraft: boolean
  isSending: boolean
  createdAt: number
  updatedAt: number
  inReplyTo?: string
  attachmentIds?: string[]
}

export interface ComposeDraftState {
  currentDraft: EmailDraft | null
  drafts: EmailDraft[]
  isLoading: boolean
  isSaving: boolean
  error: string | null
  successMessage: string | null
}

const initialState: ComposeDraftState = {
  currentDraft: null,
  drafts: [],
  isLoading: false,
  isSaving: false,
  error: null,
  successMessage: null
}

/**
 * Async thunk to save draft to server
 */
export const saveDraftAsync = createAsyncThunk<
  EmailDraft,
  { draft: EmailDraft; baseUrl?: string },
  { rejectValue: string }
>(
  'emailCompose/saveDraftAsync',
  async ({ draft, baseUrl = '' }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${baseUrl}/api/v1/email/drafts`, {
        method: draft.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft)
      })

      if (!response.ok) {
        throw new Error('Failed to save draft')
      }

      return await response.json()
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Unknown error occurred'
      )
    }
  }
)

/**
 * Async thunk to send email
 */
export const sendEmailAsync = createAsyncThunk<
  { success: boolean; messageId: string },
  { draft: EmailDraft; baseUrl?: string },
  { rejectValue: string }
>(
  'emailCompose/sendEmailAsync',
  async ({ draft, baseUrl = '' }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${baseUrl}/api/v1/email/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...draft,
          isDraft: false,
          isSending: true
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send email')
      }

      return await response.json()
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Unknown error occurred'
      )
    }
  }
)

/**
 * Async thunk to fetch drafts
 */
export const fetchDrafts = createAsyncThunk<
  EmailDraft[],
  { baseUrl?: string } | void,
  { rejectValue: string }
>(
  'emailCompose/fetchDrafts',
  async (arg, { rejectWithValue }) => {
    const baseUrl = (arg && 'baseUrl' in arg) ? arg.baseUrl ?? '' : ''
    try {
      const response = await fetch(`${baseUrl}/api/v1/email/drafts`)
      if (!response.ok) {
        throw new Error('Failed to fetch drafts')
      }
      return await response.json()
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Unknown error occurred'
      )
    }
  }
)

export const emailComposeSlice = createSlice({
  name: 'emailCompose',
  initialState,
  reducers: {
    // Create new draft
    createDraft: (state) => {
      const newDraft: EmailDraft = {
        id: `draft_${Date.now()}`,
        to: [],
        cc: [],
        bcc: [],
        subject: '',
        textBody: '',
        isDraft: true,
        isSending: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
      state.currentDraft = newDraft
      state.drafts.push(newDraft)
    },

    // Update draft field
    updateDraft: (
      state,
      action: PayloadAction<{
        field: keyof EmailDraft
        value: unknown
      }>
    ) => {
      if (state.currentDraft) {
        const { field, value } = action.payload
        ;(state.currentDraft as Record<string, unknown>)[field] = value
        state.currentDraft.updatedAt = Date.now()
      }
    },

    // Update multiple draft fields
    updateDraftMultiple: (
      state,
      action: PayloadAction<Partial<EmailDraft>>
    ) => {
      if (state.currentDraft) {
        Object.assign(state.currentDraft, action.payload)
        state.currentDraft.updatedAt = Date.now()
      }
    },

    // Add recipient (to, cc, bcc)
    addRecipient: (
      state,
      action: PayloadAction<{
        type: 'to' | 'cc' | 'bcc'
        email: string
      }>
    ) => {
      if (state.currentDraft) {
        const { type, email } = action.payload
        if (!state.currentDraft[type].includes(email)) {
          state.currentDraft[type].push(email)
          state.currentDraft.updatedAt = Date.now()
        }
      }
    },

    // Remove recipient
    removeRecipient: (
      state,
      action: PayloadAction<{
        type: 'to' | 'cc' | 'bcc'
        email: string
      }>
    ) => {
      if (state.currentDraft) {
        const { type, email } = action.payload
        state.currentDraft[type] = state.currentDraft[type].filter((e) => e !== email)
        state.currentDraft.updatedAt = Date.now()
      }
    },

    // Add attachment
    addAttachment: (state, action: PayloadAction<string>) => {
      if (state.currentDraft) {
        if (!state.currentDraft.attachmentIds) {
          state.currentDraft.attachmentIds = []
        }
        if (!state.currentDraft.attachmentIds.includes(action.payload)) {
          state.currentDraft.attachmentIds.push(action.payload)
          state.currentDraft.updatedAt = Date.now()
        }
      }
    },

    // Remove attachment
    removeAttachment: (state, action: PayloadAction<string>) => {
      if (state.currentDraft) {
        state.currentDraft.attachmentIds = (
          state.currentDraft.attachmentIds || []
        ).filter((id) => id !== action.payload)
        state.currentDraft.updatedAt = Date.now()
      }
    },

    // Set current draft
    setCurrentDraft: (state, action: PayloadAction<EmailDraft | null>) => {
      state.currentDraft = action.payload
    },

    // Clear current draft
    clearDraft: (state) => {
      state.currentDraft = null
      state.error = null
      state.successMessage = null
    },

    // Delete draft
    deleteDraft: (state, action: PayloadAction<string>) => {
      state.drafts = state.drafts.filter((d) => d.id !== action.payload)
      if (state.currentDraft?.id === action.payload) {
        state.currentDraft = null
      }
    },

    // Clear error
    clearError: (state) => {
      state.error = null
    },

    // Clear success message
    clearSuccessMessage: (state) => {
      state.successMessage = null
    }
  },

  extraReducers: (builder) => {
    builder
      // Save draft - pending
      .addCase(saveDraftAsync.pending, (state) => {
        state.isSaving = true
        state.error = null
      })
      // Save draft - fulfilled
      .addCase(saveDraftAsync.fulfilled, (state, action) => {
        state.isSaving = false
        state.currentDraft = action.payload
        state.drafts = state.drafts.map((d) =>
          d.id === action.payload.id ? action.payload : d
        )
        state.successMessage = 'Draft saved successfully'
      })
      // Save draft - rejected
      .addCase(saveDraftAsync.rejected, (state, action) => {
        state.isSaving = false
        state.error = action.payload || 'Failed to save draft'
      })
      // Send email - pending
      .addCase(sendEmailAsync.pending, (state) => {
        state.isLoading = true
        state.error = null
        if (state.currentDraft) {
          state.currentDraft.isSending = true
        }
      })
      // Send email - fulfilled
      .addCase(sendEmailAsync.fulfilled, (state) => {
        state.isLoading = false
        state.currentDraft = null
        state.successMessage = 'Email sent successfully'
      })
      // Send email - rejected
      .addCase(sendEmailAsync.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || 'Failed to send email'
        if (state.currentDraft) {
          state.currentDraft.isSending = false
        }
      })
      // Fetch drafts - pending
      .addCase(fetchDrafts.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      // Fetch drafts - fulfilled
      .addCase(fetchDrafts.fulfilled, (state, action) => {
        state.isLoading = false
        state.drafts = action.payload
      })
      // Fetch drafts - rejected
      .addCase(fetchDrafts.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || 'Failed to fetch drafts'
        state.drafts = []
      })
  }
})

export const {
  createDraft,
  updateDraft,
  updateDraftMultiple,
  addRecipient,
  removeRecipient,
  addAttachment,
  removeAttachment,
  setCurrentDraft,
  clearDraft,
  deleteDraft,
  clearError,
  clearSuccessMessage
} = emailComposeSlice.actions

// Selectors
export const selectCurrentDraft = (state: { emailCompose: ComposeDraftState }) =>
  state.emailCompose.currentDraft

export const selectDrafts = (state: { emailCompose: ComposeDraftState }) =>
  state.emailCompose.drafts

export const selectIsLoading = (state: { emailCompose: ComposeDraftState }) =>
  state.emailCompose.isLoading

export const selectIsSaving = (state: { emailCompose: ComposeDraftState }) =>
  state.emailCompose.isSaving

export const selectError = (state: { emailCompose: ComposeDraftState }) =>
  state.emailCompose.error

export const selectSuccessMessage = (state: { emailCompose: ComposeDraftState }) =>
  state.emailCompose.successMessage

export const selectDraftCount = (state: { emailCompose: ComposeDraftState }) =>
  state.emailCompose.drafts.length

export default emailComposeSlice.reducer
