/**
 * Redux Slice for Email Detail/Thread View State Management
 * Handles selected email details and conversation threads
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

export interface EmailDetail {
  id: string
  from: string
  to: string[]
  cc?: string[]
  bcc?: string[]
  subject: string
  textBody?: string
  htmlBody?: string
  receivedAt: number
  isRead: boolean
  isStarred: boolean
  attachments?: Array<{
    id: string
    filename: string
    mimeType: string
    size: number
    downloadUrl?: string
  }>
  conversationId?: string
  replyTo?: string
}

export interface ThreadMessage extends EmailDetail {
  isReply: boolean
}

export interface EmailDetailState {
  selectedEmail: EmailDetail | null
  threadMessages: ThreadMessage[]
  isLoading: boolean
  error: string | null
}

const initialState: EmailDetailState = {
  selectedEmail: null,
  threadMessages: [],
  isLoading: false,
  error: null
}

/**
 * Async thunk to fetch email details
 */
export const fetchEmailDetail = createAsyncThunk<
  EmailDetail,
  { messageId: string; baseUrl?: string },
  { rejectValue: string }
>(
  'emailDetail/fetchEmailDetail',
  async ({ messageId, baseUrl = '' }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${baseUrl}/api/v1/email/messages/${messageId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch email details')
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
 * Async thunk to fetch conversation thread
 */
export const fetchConversationThread = createAsyncThunk<
  ThreadMessage[],
  { conversationId: string; baseUrl?: string },
  { rejectValue: string }
>(
  'emailDetail/fetchConversationThread',
  async ({ conversationId, baseUrl = '' }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${baseUrl}/api/v1/email/conversations/${conversationId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch conversation thread')
      }
      return await response.json()
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Unknown error occurred'
      )
    }
  }
)

export const emailDetailSlice = createSlice({
  name: 'emailDetail',
  initialState,
  reducers: {
    // Set selected email
    setSelectedEmail: (state, action: PayloadAction<EmailDetail | null>) => {
      state.selectedEmail = action.payload
    },

    // Add message to thread
    addToThread: (state, action: PayloadAction<ThreadMessage>) => {
      state.threadMessages.push(action.payload)
    },

    // Clear thread
    clearThread: (state) => {
      state.threadMessages = []
    },

    // Update email read status
    setEmailRead: (state, action: PayloadAction<boolean>) => {
      if (state.selectedEmail) {
        state.selectedEmail.isRead = action.payload
      }
    },

    // Update email starred status
    setEmailStarred: (state, action: PayloadAction<boolean>) => {
      if (state.selectedEmail) {
        state.selectedEmail.isStarred = action.payload
      }
    },

    // Clear selected email and thread
    clearEmailDetail: (state) => {
      state.selectedEmail = null
      state.threadMessages = []
    },

    // Error handling
    clearError: (state) => {
      state.error = null
    }
  },

  extraReducers: (builder) => {
    builder
      // Fetch email detail - pending
      .addCase(fetchEmailDetail.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      // Fetch email detail - fulfilled
      .addCase(fetchEmailDetail.fulfilled, (state, action) => {
        state.isLoading = false
        state.selectedEmail = action.payload
      })
      // Fetch email detail - rejected
      .addCase(fetchEmailDetail.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || 'Failed to fetch email details'
        state.selectedEmail = null
      })
      // Fetch conversation thread - pending
      .addCase(fetchConversationThread.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      // Fetch conversation thread - fulfilled
      .addCase(fetchConversationThread.fulfilled, (state, action) => {
        state.isLoading = false
        state.threadMessages = action.payload
      })
      // Fetch conversation thread - rejected
      .addCase(fetchConversationThread.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || 'Failed to fetch conversation thread'
        state.threadMessages = []
      })
  }
})

export const {
  setSelectedEmail,
  addToThread,
  clearThread,
  setEmailRead,
  setEmailStarred,
  clearEmailDetail,
  clearError
} = emailDetailSlice.actions

// Selectors
export const selectSelectedEmail = (state: { emailDetail: EmailDetailState }) =>
  state.emailDetail.selectedEmail

export const selectThreadMessages = (state: { emailDetail: EmailDetailState }) =>
  state.emailDetail.threadMessages

export const selectIsLoading = (state: { emailDetail: EmailDetailState }) =>
  state.emailDetail.isLoading

export const selectError = (state: { emailDetail: EmailDetailState }) =>
  state.emailDetail.error

export const selectConversationThread = (state: { emailDetail: EmailDetailState }) =>
  state.emailDetail.threadMessages

export default emailDetailSlice.reducer
