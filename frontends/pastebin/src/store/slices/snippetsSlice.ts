import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Snippet } from '@/lib/types'
import {
  fetchAllSnippets,
  fetchSnippetsByNamespace,
  createSnippet,
  updateSnippet,
  deleteSnippet,
  moveSnippet,
  bulkMoveSnippets,
} from './snippets-thunks'
import {
  type SnippetsState,
  addSnippetExtraReducers,
} from './snippets-reducers'

export {
  fetchAllSnippets,
  fetchSnippetsByNamespace,
  createSnippet,
  updateSnippet,
  deleteSnippet,
  moveSnippet,
  bulkMoveSnippets,
}

const initialState: SnippetsState = {
  items: [],
  loading: false,
  error: null,
  selectedIds: [],
  selectionMode: false,
}

const snippetsSlice = createSlice({
  name: 'snippets',
  initialState,
  reducers: {
    toggleSelectionMode: (state) => {
      state.selectionMode = !state.selectionMode
      if (!state.selectionMode) state.selectedIds = []
    },
    toggleSnippetSelection: (state, action: PayloadAction<string>) => {
      const index = state.selectedIds.indexOf(action.payload)
      if (index !== -1) {
        state.selectedIds.splice(index, 1)
      } else {
        state.selectedIds.push(action.payload)
      }
    },
    clearSelection: (state) => { state.selectedIds = [] },
    selectAllSnippets: (state) => {
      state.selectedIds = state.items.map(s => s.id)
    },
    patchSnippetLocal: (
      state,
      action: { payload: { id: string; fields: Partial<Snippet> } }
    ) => {
      const idx = state.items.findIndex(s => s.id === action.payload.id)
      if (idx !== -1) {
        state.items[idx] = { ...state.items[idx], ...action.payload.fields }
      }
    },
    addSnippetLocal: (state, action: { payload: Snippet }) => {
      state.items.unshift(action.payload)
    },
  },
  extraReducers: addSnippetExtraReducers,
})

export const {
  toggleSelectionMode,
  toggleSnippetSelection,
  clearSelection,
  selectAllSnippets,
  patchSnippetLocal,
  addSnippetLocal,
} = snippetsSlice.actions

export default snippetsSlice.reducer
