import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Snippet } from '@/lib/types'

interface UiState {
  dialogOpen: boolean
  viewerOpen: boolean
  editingSnippet: Snippet | null
  viewingSnippet: Snippet | null
  searchQuery: string
}

const initialState: UiState = {
  dialogOpen: false,
  viewerOpen: false,
  editingSnippet: null,
  viewingSnippet: null,
  searchQuery: '',
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openDialog: (state, action: PayloadAction<Snippet | null>) => {
      state.dialogOpen = true
      state.editingSnippet = action.payload
    },
    closeDialog: (state) => {
      state.dialogOpen = false
      state.editingSnippet = null
    },
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
  },
})

export const {
  openDialog,
  closeDialog,
  openViewer,
  closeViewer,
  setSearchQuery,
} = uiSlice.actions

export default uiSlice.reducer
