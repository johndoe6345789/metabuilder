import { createSlice } from '@reduxjs/toolkit'
import type { SnippetComment, ProfileComment } from '@/lib/types'
import {
  fetchSnippetComments, addSnippetComment,
  fetchProfileComments, addProfileComment,
} from './commentsThunks'

export {
  fetchSnippetComments, addSnippetComment,
  fetchProfileComments, addProfileComment,
}

interface CommentsState {
  snippetComments: Record<string, SnippetComment[]>
  profileComments: Record<string, ProfileComment[]>
  loading: boolean
  error: string | null
}

const initialState: CommentsState = {
  snippetComments: {},
  profileComments: {},
  loading: false,
  error: null,
}

function sortByTime<T extends { createdAt: number | string }>(
  items: T[]
): T[] {
  return [...items].sort((a, b) => {
    const ta = typeof a.createdAt === 'number'
      ? a.createdAt : new Date(a.createdAt).getTime()
    const tb = typeof b.createdAt === 'number'
      ? b.createdAt : new Date(b.createdAt).getTime()
    return ta - tb
  })
}

const commentsSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSnippetComments.pending, (state) => {
        state.loading = true; state.error = null
      })
      .addCase(fetchSnippetComments.fulfilled, (state, action) => {
        state.loading = false
        state.snippetComments[action.payload.snippetId] =
          sortByTime(action.payload.comments)
      })
      .addCase(fetchSnippetComments.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch comments'
      })
      .addCase(addSnippetComment.fulfilled, (state, action) => {
        const c = action.payload as SnippetComment
        const list = state.snippetComments[c.snippetId] ?? []
        state.snippetComments[c.snippetId] = [...list, c]
      })
      .addCase(addSnippetComment.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to post comment'
      })
      .addCase(fetchProfileComments.pending, (state) => {
        state.loading = true; state.error = null
      })
      .addCase(fetchProfileComments.fulfilled, (state, action) => {
        state.loading = false
        state.profileComments[action.payload.profileUserId] =
          sortByTime(action.payload.comments)
      })
      .addCase(fetchProfileComments.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch comments'
      })
      .addCase(addProfileComment.fulfilled, (state, action) => {
        const c = action.payload as ProfileComment
        const list = state.profileComments[c.profileUserId] ?? []
        state.profileComments[c.profileUserId] = [...list, c]
      })
      .addCase(addProfileComment.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to post comment'
      })
  },
})

export default commentsSlice.reducer
