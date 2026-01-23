/**
 * Redux Slice for Email Filters State Management
 * Handles saved filters and search query management
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface EmailFilter {
  id: string
  name: string
  description?: string
  criteria: {
    from?: string
    to?: string
    subject?: string
    hasAttachments?: boolean
    isRead?: boolean
    isStarred?: boolean
    dateFrom?: number
    dateTo?: number
    sizeMin?: number
    sizeMax?: number
  }
  color?: string
  createdAt: number
  updatedAt: number
}

export interface SearchQuery {
  id: string
  text: string
  timestamp: number
  frequency: number
}

export interface EmailFilterState {
  savedFilters: EmailFilter[]
  recentSearches: SearchQuery[]
  activeFilterId: string | null
  isLoading: boolean
  error: string | null
}

const initialState: EmailFilterState = {
  savedFilters: [],
  recentSearches: [],
  activeFilterId: null,
  isLoading: false,
  error: null
}

export const emailFiltersSlice = createSlice({
  name: 'emailFilters',
  initialState,
  reducers: {
    // Add new saved filter
    addFilter: (state, action: PayloadAction<EmailFilter>) => {
      const newFilter = {
        ...action.payload,
        id: action.payload.id || `filter_${Date.now()}`,
        createdAt: action.payload.createdAt || Date.now(),
        updatedAt: action.payload.updatedAt || Date.now()
      }
      state.savedFilters.push(newFilter)
    },

    // Update existing filter
    updateFilter: (state, action: PayloadAction<EmailFilter>) => {
      const index = state.savedFilters.findIndex((f) => f.id === action.payload.id)
      if (index !== -1) {
        state.savedFilters[index] = {
          ...action.payload,
          updatedAt: Date.now()
        }
      }
    },

    // Delete filter
    removeFilter: (state, action: PayloadAction<string>) => {
      state.savedFilters = state.savedFilters.filter((f) => f.id !== action.payload)
      if (state.activeFilterId === action.payload) {
        state.activeFilterId = null
      }
    },

    // Delete all filters
    clearAllFilters: (state) => {
      state.savedFilters = []
      state.activeFilterId = null
    },

    // Set active filter
    setActiveFilter: (state, action: PayloadAction<string | null>) => {
      state.activeFilterId = action.payload
    },

    // Add to recent searches
    addSearchQuery: (state, action: PayloadAction<string>) => {
      const existing = state.recentSearches.find((s) => s.text === action.payload)

      if (existing) {
        // Update frequency if search already exists
        existing.frequency += 1
        existing.timestamp = Date.now()
      } else {
        // Add new search to beginning of list
        state.recentSearches.unshift({
          id: `search_${Date.now()}`,
          text: action.payload,
          timestamp: Date.now(),
          frequency: 1
        })

        // Keep only last 20 searches
        if (state.recentSearches.length > 20) {
          state.recentSearches.pop()
        }
      }
    },

    // Remove search from history
    removeSearchQuery: (state, action: PayloadAction<string>) => {
      state.recentSearches = state.recentSearches.filter((s) => s.id !== action.payload)
    },

    // Clear search history
    clearSearchHistory: (state) => {
      state.recentSearches = []
    },

    // Reset to initial state
    resetFilters: (state) => {
      state.savedFilters = []
      state.activeFilterId = null
      state.recentSearches = []
    },

    // Error handling
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },

    clearError: (state) => {
      state.error = null
    }
  }
})

export const {
  addFilter,
  updateFilter,
  removeFilter,
  clearAllFilters,
  setActiveFilter,
  addSearchQuery,
  removeSearchQuery,
  clearSearchHistory,
  resetFilters,
  setError,
  clearError
} = emailFiltersSlice.actions

// Selectors
export const selectSavedFilters = (state: { emailFilters: EmailFilterState }) =>
  state.emailFilters.savedFilters

export const selectFilterById = (state: { emailFilters: EmailFilterState }, id: string) =>
  state.emailFilters.savedFilters.find((f) => f.id === id)

export const selectActiveFilterId = (state: { emailFilters: EmailFilterState }) =>
  state.emailFilters.activeFilterId

export const selectActiveFilter = (state: { emailFilters: EmailFilterState }) => {
  if (!state.emailFilters.activeFilterId) return null
  return state.emailFilters.savedFilters.find(
    (f) => f.id === state.emailFilters.activeFilterId
  ) || null
}

export const selectRecentSearches = (state: { emailFilters: EmailFilterState }) =>
  state.emailFilters.recentSearches

export const selectTopSearches = (state: { emailFilters: EmailFilterState }, limit: number = 5) =>
  state.emailFilters.recentSearches
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, limit)

export const selectFilterCount = (state: { emailFilters: EmailFilterState }) =>
  state.emailFilters.savedFilters.length

export const selectSearchHistoryCount = (state: { emailFilters: EmailFilterState }) =>
  state.emailFilters.recentSearches.length

export const selectError = (state: { emailFilters: EmailFilterState }) =>
  state.emailFilters.error

export default emailFiltersSlice.reducer
