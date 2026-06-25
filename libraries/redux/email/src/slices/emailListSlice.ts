/**
 * Redux Slice for Email List State Management
 * Handles message list display, selection, filtering, and pagination
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

export interface EmailMessage {
  id: string
  from: string
  subject: string
  preview: string
  receivedAt: number
  isRead: boolean
  isStarred: boolean
  attachmentCount: number
}

export interface PaginationState {
  currentPage: number
  pageSize: number
  totalMessages: number
}

export interface EmailListState {
  messages: EmailMessage[]
  selectedMessageId: string | null
  filter: 'all' | 'unread' | 'starred' | 'spam' | 'custom'
  searchQuery: string
  pagination: PaginationState
  isLoading: boolean
  error: string | null
}

const initialState: EmailListState = {
  messages: [],
  selectedMessageId: null,
  filter: 'all',
  searchQuery: '',
  pagination: {
    currentPage: 1,
    pageSize: 20,
    totalMessages: 0
  },
  isLoading: false,
  error: null
}

/**
 * Async thunk to fetch messages from API
 * Handles pagination and filtering
 */
export const fetchMessages = createAsyncThunk<
  { messages: EmailMessage[]; total: number },
  {
    folderId: string
    page?: number
    pageSize?: number
    filter?: string
    search?: string
    baseUrl?: string
  },
  { rejectValue: string }
>(
  'emailList/fetchMessages',
  async (params, { rejectWithValue }) => {
    const baseUrl = params.baseUrl ?? ''
    try {
      const query = new URLSearchParams({
        folderId: params.folderId,
        page: (params.page || 1).toString(),
        pageSize: (params.pageSize || 20).toString(),
        ...(params.filter && { filter: params.filter }),
        ...(params.search && { search: params.search })
      })

      const response = await fetch(`${baseUrl}/api/v1/email/messages?${query}`)
      if (!response.ok) {
        throw new Error('Failed to fetch messages')
      }

      return await response.json()
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Unknown error occurred'
      )
    }
  }
)

export const emailListSlice = createSlice({
  name: 'emailList',
  initialState,
  reducers: {
    // Message selection
    setSelectedMessage: (state, action: PayloadAction<string | null>) => {
      state.selectedMessageId = action.payload
    },

    // Filter management
    setFilter: (state, action: PayloadAction<'all' | 'unread' | 'starred' | 'spam' | 'custom'>) => {
      state.filter = action.payload
      state.pagination.currentPage = 1
    },

    // Search functionality
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
      state.pagination.currentPage = 1
    },

    // Clear search
    clearSearchQuery: (state) => {
      state.searchQuery = ''
      state.pagination.currentPage = 1
    },

    // Pagination
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.pagination.currentPage = action.payload
    },

    setPageSize: (state, action: PayloadAction<number>) => {
      state.pagination.pageSize = action.payload
      state.pagination.currentPage = 1
    },

    // Message flag updates
    toggleMessageRead: (state, action: PayloadAction<string>) => {
      const message = state.messages.find((m) => m.id === action.payload)
      if (message) {
        message.isRead = !message.isRead
      }
    },

    toggleMessageStarred: (state, action: PayloadAction<string>) => {
      const message = state.messages.find((m) => m.id === action.payload)
      if (message) {
        message.isStarred = !message.isStarred
      }
    },

    // Remove message from list
    removeMessage: (state, action: PayloadAction<string>) => {
      state.messages = state.messages.filter((m) => m.id !== action.payload)
      if (state.selectedMessageId === action.payload) {
        state.selectedMessageId = null
      }
    },

    // Clear all messages
    clearMessages: (state) => {
      state.messages = []
      state.selectedMessageId = null
    },

    // Error handling
    clearError: (state) => {
      state.error = null
    }
  },

  extraReducers: (builder) => {
    builder
      // Fetch messages - pending
      .addCase(fetchMessages.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      // Fetch messages - fulfilled
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.isLoading = false
        state.messages = action.payload.messages
        state.pagination.totalMessages = action.payload.total
      })
      // Fetch messages - rejected
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || 'Failed to fetch messages'
        state.messages = []
      })
  }
})

export const {
  setSelectedMessage,
  setFilter,
  setSearchQuery,
  clearSearchQuery,
  setCurrentPage,
  setPageSize,
  toggleMessageRead,
  toggleMessageStarred,
  removeMessage,
  clearMessages,
  clearError
} = emailListSlice.actions

// Selectors
export const selectMessages = (state: { emailList: EmailListState }) =>
  state.emailList.messages

export const selectSelectedMessageId = (state: { emailList: EmailListState }) =>
  state.emailList.selectedMessageId

export const selectFilter = (state: { emailList: EmailListState }) =>
  state.emailList.filter

export const selectSearchQuery = (state: { emailList: EmailListState }) =>
  state.emailList.searchQuery

export const selectPagination = (state: { emailList: EmailListState }) =>
  state.emailList.pagination

export const selectIsLoading = (state: { emailList: EmailListState }) =>
  state.emailList.isLoading

export const selectError = (state: { emailList: EmailListState }) =>
  state.emailList.error

export const selectSelectedMessage = (state: { emailList: EmailListState }) => {
  if (!state.emailList.selectedMessageId) return null
  return state.emailList.messages.find((m) => m.id === state.emailList.selectedMessageId) || null
}

export default emailListSlice.reducer
