import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { SnippetComment, ProfileComment } from '@/lib/types'
import {
  getSnippetComments,
  createSnippetComment as createSnippetCommentDB,
  getProfileComments,
  createProfileComment as createProfileCommentDB,
} from '@/lib/db'
import { getAuthToken } from '@/lib/authToken'
import type { RootState } from '@/store/index'

function getUserFromToken(): { id: string; username: string } {
  const token = getAuthToken()
  if (!token) return { id: '', username: '' }
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return { id: payload.sub ?? '', username: payload.username ?? '' }
  } catch {
    return { id: '', username: '' }
  }
}

function getUser(state: RootState): { id: string; username: string } {
  const fromToken = getUserFromToken()
  const authUser = state.auth.user
  return {
    id: fromToken.id || (authUser as Record<string, string>)?.id || '',
    username: fromToken.username || (authUser as Record<string, string>)?.username || 'anonymous',
  }
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

export const fetchSnippetComments = createAsyncThunk(
  'comments/fetchSnippet',
  async (snippetId: string) => {
    const comments = await getSnippetComments(snippetId)
    return { snippetId, comments }
  }
)

export const addSnippetComment = createAsyncThunk(
  'comments/addSnippet',
  async ({ snippetId, content }: { snippetId: string; content: string }, { getState }) => {
    const user = getUser(getState() as RootState)
    const comment: SnippetComment = {
      id: crypto.randomUUID(),
      snippetId,
      authorId: user.id,
      authorUsername: user.username,
      content: content.trim(),
      createdAt: Date.now(),
    }
    return await createSnippetCommentDB(comment)
  }
)

export const fetchProfileComments = createAsyncThunk(
  'comments/fetchProfile',
  async (profileUserId: string) => {
    const comments = await getProfileComments(profileUserId)
    return { profileUserId, comments }
  }
)

export const addProfileComment = createAsyncThunk(
  'comments/addProfile',
  async ({ profileUserId, content }: { profileUserId: string; content: string }, { getState }) => {
    const user = getUser(getState() as RootState)
    const comment: ProfileComment = {
      id: crypto.randomUUID(),
      profileUserId,
      authorId: user.id,
      authorUsername: user.username,
      content: content.trim(),
      createdAt: Date.now(),
    }
    return await createProfileCommentDB(comment)
  }
)

const commentsSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSnippetComments.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSnippetComments.fulfilled, (state, action) => {
        state.loading = false
        const sorted = [...action.payload.comments].sort((a, b) => {
          const ta = typeof a.createdAt === 'number' ? a.createdAt : new Date(a.createdAt).getTime()
          const tb = typeof b.createdAt === 'number' ? b.createdAt : new Date(b.createdAt).getTime()
          return ta - tb
        })
        state.snippetComments[action.payload.snippetId] = sorted
      })
      .addCase(fetchSnippetComments.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch comments'
      })
      .addCase(addSnippetComment.fulfilled, (state, action) => {
        const comment = action.payload
        const list = state.snippetComments[comment.snippetId] ?? []
        state.snippetComments[comment.snippetId] = [...list, comment]
      })
      .addCase(addSnippetComment.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to post comment'
      })
      .addCase(fetchProfileComments.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProfileComments.fulfilled, (state, action) => {
        state.loading = false
        const sorted = [...action.payload.comments].sort((a, b) => {
          const ta = typeof a.createdAt === 'number' ? a.createdAt : new Date(a.createdAt).getTime()
          const tb = typeof b.createdAt === 'number' ? b.createdAt : new Date(b.createdAt).getTime()
          return ta - tb
        })
        state.profileComments[action.payload.profileUserId] = sorted
      })
      .addCase(fetchProfileComments.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch comments'
      })
      .addCase(addProfileComment.fulfilled, (state, action) => {
        const comment = action.payload
        const list = state.profileComments[comment.profileUserId] ?? []
        state.profileComments[comment.profileUserId] = [...list, comment]
      })
      .addCase(addProfileComment.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to post comment'
      })
  },
})

export default commentsSlice.reducer
