import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'

const data = vi.hoisted(() => ({ fetchUsers: vi.fn() }))
const scope = vi.hoisted(() => ({
  useCurrentTenantScope: vi.fn(() => ({
    tenant: 'kestrelbindery',
    canPickOtherTenant: false,
  })),
}))
const auth = vi.hoisted(() => ({
  useAuthContext: vi.fn(() => ({ user: { id: 'me', role: 'god' } })),
}))
const roles = vi.hoisted(() => ({ updateUserRole: vi.fn() }))
vi.mock('./use-current-tenant-scope', () => scope)
vi.mock('@/app/_components/auth-provider/auth-provider-component', () => auth)
vi.mock('./users-roles', async importOriginal => {
  const actual = await importOriginal<Record<string, unknown>>()
  return { ...actual, updateUserRole: roles.updateUserRole }
})
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

describe('tenant scope', () => {
  it('loads the users of the tenant whose panel this is', async () => {
    renderHook(() => useUsersTab())
    await waitFor(() => {
      expect(data.fetchUsers).toHaveBeenCalledWith('kestrelbindery')
    })
  })
})

describe('changing a role', () => {
  it('says who is looking, so rows can decide what to offer', () => {
    const { result } = renderHook(() => useUsersTab())
    expect(result.current.caller).toEqual({ id: 'me', role: 'god' })
  })

  it('writes the role to the tenant whose panel this is', async () => {
    roles.updateUserRole.mockResolvedValue(undefined)
    const { result } = renderHook(() => useUsersTab())
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(() => result.current.changeRole(users[0], 'moderator'))

    expect(roles.updateUserRole).toHaveBeenCalledWith(
      'kestrelbindery',
      'u1',
      'moderator'
    )
    expect(result.current.filtered[0].role).toBe('moderator')
    expect(result.current.roleCounts).toEqual({ moderator: 1, admin: 1 })
  })
})
