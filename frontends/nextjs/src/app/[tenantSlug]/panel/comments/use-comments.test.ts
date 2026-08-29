import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'

const api = vi.hoisted(() => ({
  fetchComments: vi.fn(),
  postComment: vi.fn(),
  deleteComment: vi.fn(),
}))
vi.mock('./comment-api', () => api)

import { useComments } from './use-comments'
import type { Comment } from './comment-types'

const existing: Comment = {
  id: 'c1',
  userId: 'u1',
  username: 'alice',
  content: 'hello',
  createdAt: 1,
}

const fresh: Comment = { ...existing, id: 'c2', content: 'second' }

beforeEach(() => {
  vi.clearAllMocks()
  api.fetchComments.mockResolvedValue([existing])
  api.postComment.mockResolvedValue(true)
  api.deleteComment.mockResolvedValue(true)
})

describe('useComments', () => {
  it('starts empty and loading', () => {
    const { result } = renderHook(() => useComments())
    expect(result.current.status).toBe('loading')
    expect(result.current.comments).toEqual([])
  })

  it('shows what it loaded', async () => {
    const { result } = renderHook(() => useComments())
    await waitFor(() => {
      expect(result.current.status).toBe('ready')
    })
    expect(result.current.comments).toEqual([existing])
  })

  // The page used to seed a "Welcome to MetaBuilder!" comment on failure,
  // which reads as a real post by a real account.
  it('reports unreachable rather than inventing a comment', async () => {
    api.fetchComments.mockResolvedValue(null)
    const { result } = renderHook(() => useComments())
    await waitFor(() => {
      expect(result.current.status).toBe('unreachable')
    })
    expect(result.current.comments).toEqual([])
  })

  it('appends a posted comment', async () => {
    const { result } = renderHook(() => useComments())
    await waitFor(() => {
      expect(result.current.comments).toHaveLength(1)
    })
    await act(async () => {
      expect(await result.current.post(fresh)).toBe(true)
    })
    expect(result.current.comments.map(c => c.id)).toEqual(['c1', 'c2'])
  })

  it('does not append when the post is refused', async () => {
    api.postComment.mockResolvedValue(false)
    const { result } = renderHook(() => useComments())
    await waitFor(() => {
      expect(result.current.comments).toHaveLength(1)
    })
    await act(async () => {
      expect(await result.current.post(fresh)).toBe(false)
    })
    expect(result.current.comments).toHaveLength(1)
  })

  it('removes a deleted comment', async () => {
    const { result } = renderHook(() => useComments())
    await waitFor(() => {
      expect(result.current.comments).toHaveLength(1)
    })
    await act(async () => {
      await result.current.remove('c1')
    })
    expect(result.current.comments).toEqual([])
  })

  it('keeps the comment when the delete is refused', async () => {
    api.deleteComment.mockResolvedValue(false)
    const { result } = renderHook(() => useComments())
    await waitFor(() => {
      expect(result.current.comments).toHaveLength(1)
    })
    await act(async () => {
      expect(await result.current.remove('c1')).toBe(false)
    })
    expect(result.current.comments).toHaveLength(1)
  })
})
