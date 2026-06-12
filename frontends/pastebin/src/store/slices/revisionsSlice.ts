import { createSlice, type Action } from '@reduxjs/toolkit'
import type { SnippetRevision } from '@/lib/types'
import {
  fetchRevisions,
  revertToRevision,
  forkSnippet,
  forkSharedSnippet,
} from './revisionsThunks'

export { fetchRevisions, revertToRevision, forkSnippet, forkSharedSnippet }

interface RevisionsState {
  bySnippetId: Record<string, SnippetRevision[]>
  loading: boolean
  error: string | null
}

const initialState: RevisionsState = {
  bySnippetId: {},
  loading: false,
  error: null,
}

function pendingReducer(state: RevisionsState) {
  state.loading = true
  state.error = null
}

const revisionsSlice = createSlice({
  name: 'revisions',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchRevisions.pending, pendingReducer)
      .addCase(fetchRevisions.fulfilled, (state, action) => {
        state.loading = false
        state.bySnippetId[action.payload.snippetId] = action.payload.revisions
      })
      .addCase(fetchRevisions.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch revisions'
      })
      .addCase(revertToRevision.pending, pendingReducer)
      .addCase(revertToRevision.fulfilled, state => {
        state.loading = false
      })
      .addCase(revertToRevision.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to revert to revision'
      })
      .addCase(forkSnippet.pending, pendingReducer)
      .addCase(forkSnippet.fulfilled, state => {
        state.loading = false
      })
      .addCase(forkSnippet.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fork snippet'
      })
      .addCase(forkSharedSnippet.pending, pendingReducer)
      .addCase(forkSharedSnippet.fulfilled, state => {
        state.loading = false
      })
      .addCase(forkSharedSnippet.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fork shared snippet'
      })
      .addMatcher(
        (action: Action) => action.type === 'persist/REHYDRATE',
        state => {
          state.loading = false
          state.error = null
        },
      )
  },
})

export default revisionsSlice.reducer
