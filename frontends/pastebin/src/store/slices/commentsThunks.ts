import { createAsyncThunk } from '@reduxjs/toolkit'
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

export function getUser(state: RootState): { id: string; username: string } {
  const fromToken = getUserFromToken()
  const authUser = state.auth.user as Record<string, string> | null
  return {
    id: fromToken.id || authUser?.id || '',
    username: fromToken.username || authUser?.username || 'anonymous',
  }
}

export const fetchSnippetComments = createAsyncThunk(
  'comments/fetchSnippet',
  async (snippetId: string) => {
    const comments = await getSnippetComments(snippetId)
    return { snippetId, comments }
  },
)

export const addSnippetComment = createAsyncThunk(
  'comments/addSnippet',
  async (
    { snippetId, content }: { snippetId: string; content: string },
    { getState },
  ) => {
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
  },
)

export const fetchProfileComments = createAsyncThunk(
  'comments/fetchProfile',
  async (profileUserId: string) => {
    const comments = await getProfileComments(profileUserId)
    return { profileUserId, comments }
  },
)

export const addProfileComment = createAsyncThunk(
  'comments/addProfile',
  async (
    { profileUserId, content }: { profileUserId: string; content: string },
    { getState },
  ) => {
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
  },
)
