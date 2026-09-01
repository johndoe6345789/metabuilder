import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { usePowerTransferUsers } from './use-power-transfer-users'

function mockFetch(impl: () => Promise<Response>) {
  vi.stubGlobal('fetch', vi.fn(impl))
}

afterEach(() => {
  vi.unstubAllGlobals()
})

const USERS = [
  { id: 'me', username: 'me', email: 'me@x', role: 'admin' },
  { id: 'other', username: 'other', email: 'other@x', role: 'admin' },
  { id: 'boss', username: 'boss', email: 'boss@x', role: 'supergod' },
]

describe('usePowerTransferUsers', () => {
  it('starts with no users and no selection', () => {
    mockFetch(async () => ({ ok: true, json: async () => ({}) }) as Response)
    const { result } = renderHook(() => usePowerTransferUsers('me'))
    expect(result.current.allUsers).toEqual([])
    expect(result.current.selectedUserId).toBeNull()
  })

  it('excludes the current user and any supergod', async () => {
    mockFetch(
      async () =>
        ({ ok: true, json: async () => ({ data: USERS }) }) as Response
    )
    const { result } = renderHook(() => usePowerTransferUsers('me'))

    await waitFor(() => expect(result.current.allUsers).toHaveLength(1))
    expect(result.current.allUsers[0].id).toBe('other')
  })

  it('refetches when currentUserId changes', async () => {
    const fetchFn = vi.fn(
      async () =>
        ({ ok: true, json: async () => ({ data: USERS }) }) as Response
    )
    mockFetch(fetchFn)
    const { rerender } = renderHook(
      ({ id }) => usePowerTransferUsers(id),
      { initialProps: { id: 'me' as string | undefined } }
    )
    await waitFor(() => expect(fetchFn).toHaveBeenCalledTimes(1))

    rerender({ id: 'other' })

    await waitFor(() => expect(fetchFn).toHaveBeenCalledTimes(2))
  })

  it('leaves the list empty when the response is not ok', async () => {
    mockFetch(async () => ({ ok: false, status: 500 }) as Response)
    const { result } = renderHook(() => usePowerTransferUsers('me'))
    await new Promise(r => setTimeout(r, 10))
    expect(result.current.allUsers).toEqual([])
  })

  it('leaves the list empty when the fetch throws', async () => {
    mockFetch(async () => {
      throw new Error('offline')
    })
    const { result } = renderHook(() => usePowerTransferUsers('me'))
    await new Promise(r => setTimeout(r, 10))
    expect(result.current.allUsers).toEqual([])
  })

  it('setSelectedUserId updates the selection', () => {
    mockFetch(async () => ({ ok: true, json: async () => ({}) }) as Response)
    const { result } = renderHook(() => usePowerTransferUsers('me'))
    act(() => result.current.setSelectedUserId('other'))
    expect(result.current.selectedUserId).toBe('other')
  })
})
