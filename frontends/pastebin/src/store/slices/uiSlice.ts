import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Snippet } from '@/lib/types'

export type AppLocale = 'en' | 'es'
export type AppTheme = 'light' | 'dark'

interface UiState {
  viewerOpen: boolean
  viewingSnippet: Snippet | null
  searchQuery: string
  locale: AppLocale
  theme: AppTheme
}

const initialState: UiState = {
  viewerOpen: false,
  viewingSnippet: null,
  searchQuery: '',
  locale: 'en',
  theme: 'light',
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openViewer: (state, action: PayloadAction<Snippet>) => {
      state.viewerOpen = true
      state.viewingSnippet = action.payload
    },
    closeViewer: (state) => {
      state.viewerOpen = false
      state.viewingSnippet = null
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
    },
    setLocale: (state, action: PayloadAction<AppLocale>) => {
      state.locale = action.payload
    },
    setTheme: (state, action: PayloadAction<AppTheme>) => {
      state.theme = action.payload
    },
  },
})

export const {
  openViewer,
  closeViewer,
  setSearchQuery,
  setLocale,
  setTheme,
} = uiSlice.actions

export default uiSlice.reducer
