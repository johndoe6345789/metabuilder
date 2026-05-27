import { createSlice, type Action } from '@reduxjs/toolkit'
import {
  type SharedSnippet,
  generateShareToken,
  revokeShareToken,
  fetchSharedSnippet,
} from './share-thunks'

export type { SharedSnippet }
export { generateShareToken, revokeShareToken, fetchSharedSnippet }

interface ShareState {
  sharedSnippets: Record<string, SharedSnippet>
  loading: boolean
  error: string | null
}

const initialState: ShareState = {
  sharedSnippets: {},
  loading: false,
  error: null,
}

const shareSlice = createSlice({
  name: 'share',
  initialState,
  reducers: {
    clearShareError(state) { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateShareToken.pending, state => {
        state.loading = true; state.error = null
      })
      .addCase(generateShareToken.fulfilled, state => {
        state.loading = false
      })
      .addCase(generateShareToken.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(revokeShareToken.pending, state => {
        state.loading = true; state.error = null
      })
      .addCase(revokeShareToken.fulfilled, state => {
        state.loading = false
      })
      .addCase(revokeShareToken.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(fetchSharedSnippet.pending, state => {
        state.loading = true; state.error = null
      })
      .addCase(fetchSharedSnippet.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload?.shareToken) {
          state.sharedSnippets[action.payload.shareToken] = action.payload
        }
      })
      .addCase(fetchSharedSnippet.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addMatcher(
        (action: Action) => action.type === 'persist/REHYDRATE',
        state => { state.loading = false; state.error = null },
      )
  },
})

export const { clearShareError } = shareSlice.actions
export default shareSlice.reducer
