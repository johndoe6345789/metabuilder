import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'

const api = vi.hoisted(() => ({
  fetchUsers: vi.fn(),
  fetchCommentCount: vi.fn(),
  deleteUser: vi.fn(),
}))
vi.mock('./admin-api', () => api)

import { useAdminData } from './use-admin-data'

const rows = [
  {
    id: '1',
    username: 'alice',
    email: 'a@b.c',
    role: 'admin',
    createdAt: '2026-01-01',
  },
  {
    id: '2',
    username: 'bob',
    email: 'b@b.c',
    role: 'user',
    createdAt: '2026-01-02',
  },
]

beforeEach(() => {
  vi.clearAllMocks()
  api.fetchUsers.mockResolvedValue(rows)
  api.fetchCommentCount.mockResolvedValue(4)
  api.deleteUser.mockResolvedValue(true)
})

describe('useAdminData', () => {
  it('starts out loading with nothing to show', () => {
    const { result } = renderHook(() => useAdminData())
    expect(result.current.status).toBe('loading')
    expect(result.current.users).toEqual([])
  })

  it('loads the accounts and the comment count', async () => {
    const { result } = renderHook(() => useAdminData())
    await waitFor(() => {
      expect(result.current.status).toBe('ready')
    })
    expect(result.current.users).toHaveLength(2)
    expect(result.current.commentCount).toBe(4)
  })

  it('derives the headline counts from what it loaded', async () => {
    const { result } = renderHook(() => useAdminData())
    await waitFor(() => {
      expect(result.current.status).toBe('ready')
    })
    expect(result.current.stats.map(s => s.count)).toEqual([2, 4, 1])
  })

  // An unreachable data layer must not read as an empty user table: this
  // panel used to invent a `demo` and an `admin` account in that case.
  it('reports unreachable rather than inventing accounts', async () => {
    api.fetchUsers.mockResolvedValue(null)
    const { result } = renderHook(() => useAdminData())
    await waitFor(() => {
      expect(result.current.status).toBe('unreachable')
    })
    expect(result.current.users).toEqual([])
  })

  it('treats an uncountable comment table as zero, not as a failure', async () => {
    api.fetchCommentCount.mockResolvedValue(null)
    const { result } = renderHook(() => useAdminData())
    await waitFor(() => {
      expect(result.current.status).toBe('ready')
    })
    expect(result.current.commentCount).toBe(0)
  })

  it('removes an account only once the write succeeded', async () => {
    const { result } = renderHook(() => useAdminData())
    await waitFor(() => {
      expect(result.current.users).toHaveLength(2)
    })
    await act(async () => {
      await result.current.removeUser('1')
    })
    expect(api.deleteUser).toHaveBeenCalledWith('1')
    expect(result.current.users.map(u => u.id)).toEqual(['2'])
  })

  it('keeps the row when the delete is refused', async () => {
    api.deleteUser.mockResolvedValue(false)
    const { result } = renderHook(() => useAdminData())
    await waitFor(() => {
      expect(result.current.users).toHaveLength(2)
    })
    await act(async () => {
      expect(await result.current.removeUser('1')).toBe(false)
    })
    expect(result.current.users).toHaveLength(2)
  })
})
