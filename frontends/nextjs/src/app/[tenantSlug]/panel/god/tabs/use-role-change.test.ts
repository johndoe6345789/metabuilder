import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import type { Dispatch, SetStateAction } from 'react'

import type { UserRow } from './users-data'

const roles = vi.hoisted(() => ({ updateUserRole: vi.fn() }))
vi.mock('./users-roles', async importOriginal => {
  const actual = await importOriginal<Record<string, unknown>>()
  return { ...actual, updateUserRole: roles.updateUserRole }
})

import { useRoleChange } from './use-role-change'

const alice: UserRow = { id: 'u1', username: 'alice', role: 'user' }
const bob: UserRow = { id: 'u2', username: 'bob', role: 'user' }

/** A stand-in for the list's setState that records what it was given. */
function listOf(initial: UserRow[]) {
  let users = initial
  const setUsers: Dispatch<SetStateAction<UserRow[]>> = next => {
    users = typeof next === 'function' ? next(users) : next
  }
  return { setUsers, read: () => users }
}

beforeEach(() => {
  vi.clearAllMocks()
  roles.updateUserRole.mockResolvedValue(undefined)
})

describe('useRoleChange', () => {
  it('shows the new role at once and writes it', async () => {
    const list = listOf([alice, bob])
    const { result } = renderHook(() =>
      useRoleChange('kestrelbindery', list.setUsers)
    )

    await act(() => result.current.changeRole(alice, 'moderator'))

    expect(list.read().map(u => u.role)).toEqual(['moderator', 'user'])
    expect(roles.updateUserRole).toHaveBeenCalledWith(
      'kestrelbindery',
      'u1',
      'moderator'
    )
    expect(result.current.roleError).toBeNull()
  })

  it('puts the old role back and says why when the write is refused', async () => {
    roles.updateUserRole.mockRejectedValue(new Error('HTTP 403'))
    const list = listOf([alice, bob])
    const { result } = renderHook(() =>
      useRoleChange('kestrelbindery', list.setUsers)
    )

    await act(() => result.current.changeRole(alice, 'admin'))

    expect(list.read().map(u => u.role)).toEqual(['user', 'user'])
    expect(result.current.roleError).toBe(
      'Could not change alice to admin: HTTP 403'
    )
  })

  it('clears an earlier failure once a change succeeds', async () => {
    roles.updateUserRole.mockRejectedValueOnce(new Error('HTTP 502'))
    const list = listOf([alice])
    const { result } = renderHook(() => useRoleChange('t', list.setUsers))

    await act(() => result.current.changeRole(alice, 'admin'))
    expect(result.current.roleError).not.toBeNull()

    await act(() => result.current.changeRole(alice, 'moderator'))
    expect(result.current.roleError).toBeNull()
    expect(list.read()[0].role).toBe('moderator')
  })

  it('does nothing for a row without an id', async () => {
    const list = listOf([{ username: 'ghost', role: 'user' }])
    const { result } = renderHook(() => useRoleChange('t', list.setUsers))

    await act(() => result.current.changeRole(list.read()[0], 'admin'))

    expect(roles.updateUserRole).not.toHaveBeenCalled()
    expect(list.read()[0].role).toBe('user')
  })
})
