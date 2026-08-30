import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'

const data = vi.hoisted(() => ({ fetchUsers: vi.fn() }))
vi.mock('./users-data', async importOriginal => {
  const actual = await importOriginal<Record<string, unknown>>()
  return { ...actual, fetchUsers: data.fetchUsers }
})

import { useUsersTab } from './use-users-tab'

const users = [
  { id: 'u1', username: 'alice', role: 'user' },
  { id: 'u2', username: 'bob', role: 'admin' },
]

beforeEach(() => {
  vi.clearAllMocks()
  data.fetchUsers.mockResolvedValue(users)
})

describe('useUsersTab', () => {
  it('starts loading with nothing loaded', () => {
    const { result } = renderHook(() => useUsersTab())
    expect(result.current.loading).toBe(true)
    expect(result.current.filtered).toEqual([])
  })

  it('loads the users and derives the role summary', async () => {
    const { result } = renderHook(() => useUsersTab())
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.filtered).toEqual(users)
    expect(result.current.roleCounts).toEqual({ user: 1, admin: 1 })
    expect(result.current.error).toBeNull()
  })

  it('reports a load failure rather than an empty table', async () => {
    data.fetchUsers.mockRejectedValue(new Error('HTTP 403'))
    const { result } = renderHook(() => useUsersTab())
    await waitFor(() => {
      expect(result.current.error).toBe('HTTP 403')
    })
    expect(result.current.loading).toBe(false)
  })

  it('narrows the filtered list as the query changes', async () => {
    const { result } = renderHook(() => useUsersTab())
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    act(() => {
      result.current.setQuery('bob')
    })
    expect(result.current.filtered.map(u => u.username)).toEqual(['bob'])
  })

  it('reports a generic message for a non-Error rejection', async () => {
    data.fetchUsers.mockRejectedValue('boom')
    const { result } = renderHook(() => useUsersTab())
    await waitFor(() => {
      expect(result.current.error).toBe('Failed to load users')
    })
  })
})
