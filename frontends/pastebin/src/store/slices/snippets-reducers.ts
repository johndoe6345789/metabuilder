/**
 * Extra reducers for snippetsSlice
 */

import type { ActionReducerMapBuilder } from '@reduxjs/toolkit'
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

export interface SnippetsState {
  items: Snippet[]
  loading: boolean
  error: string | null
  selectedIds: string[]
  selectionMode: boolean
}

function setPending(state: SnippetsState) {
  state.loading = true
  state.error = null
}

function setFailed(msg: string) {
  return (state: SnippetsState, action: { error: { message?: string } }) => {
    state.loading = false
    state.error = action.error.message || msg
  }
}

export function addSnippetExtraReducers(
  builder: ActionReducerMapBuilder<SnippetsState>
) {
  builder
    .addCase(fetchAllSnippets.pending, setPending)
    .addCase(fetchAllSnippets.fulfilled, (state, action) => {
      state.loading = false
      state.items = action.payload
    })
    .addCase(fetchAllSnippets.rejected, setFailed('Failed to fetch snippets'))
    .addCase(fetchSnippetsByNamespace.pending, setPending)
    .addCase(fetchSnippetsByNamespace.fulfilled, (state, action) => {
      state.loading = false
      state.items = action.payload
    })
    .addCase(
      fetchSnippetsByNamespace.rejected,
      setFailed('Failed to fetch snippets')
    )
    .addCase(createSnippet.pending, setPending)
    .addCase(createSnippet.fulfilled, (state, action) => {
      state.loading = false
      state.items.unshift(action.payload)
    })
    .addCase(createSnippet.rejected, setFailed('Operation failed'))
    .addCase(updateSnippet.pending, setPending)
    .addCase(updateSnippet.fulfilled, (state, action) => {
      state.loading = false
      const index = state.items.findIndex(s => s.id === action.payload.id)
      if (index !== -1) state.items[index] = action.payload
    })
    .addCase(updateSnippet.rejected, setFailed('Operation failed'))
    .addCase(deleteSnippet.pending, setPending)
    .addCase(deleteSnippet.fulfilled, (state, action) => {
      state.loading = false
      state.items = state.items.filter(s => s.id !== action.payload)
    })
    .addCase(deleteSnippet.rejected, setFailed('Operation failed'))
    .addCase(moveSnippet.pending, setPending)
    .addCase(moveSnippet.fulfilled, (state, action) => {
      state.loading = false
      const { snippetId, targetNamespaceId } = action.payload
      const item = state.items.find(s => s.id === snippetId)
      if (item) item.namespaceId = targetNamespaceId
    })
    .addCase(moveSnippet.rejected, setFailed('Operation failed'))
    .addCase(bulkMoveSnippets.pending, setPending)
    .addCase(bulkMoveSnippets.fulfilled, (state, action) => {
      state.loading = false
      const { snippetIds, targetNamespaceId } = action.payload
      state.items.forEach(s => {
        if (snippetIds.includes(s.id)) s.namespaceId = targetNamespaceId
      })
      state.selectedIds = []
      state.selectionMode = false
    })
    .addCase(bulkMoveSnippets.rejected, setFailed('Operation failed'))
}
