import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'

const authStore = vi.hoisted(() => ({
  authStore: {
    getState: vi.fn(() => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
    })),
    subscribe: vi.fn((_listener: () => void) => vi.fn()),
    ensureSessionChecked: vi.fn().mockResolvedValue(undefined),
    logout: vi.fn().mockResolvedValue(undefined),
    refresh: vi.fn().mockResolvedValue(undefined),
  },
}))

vi.mock('./auth/auth-store', () => authStore)

import { useAuth } from './useAuth'

beforeEach(() => {
  vi.clearAllMocks()
  authStore.authStore.getState.mockReturnValue({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  })
  authStore.authStore.subscribe.mockImplementation(() => vi.fn())
})

describe('useAuth', () => {
  it('starts with the store\'s current state', () => {
    authStore.authStore.getState.mockReturnValue({
      user: { id: 'u1', email: 'a@x' },
      isAuthenticated: true,
      isLoading: false,
    })
    const { result } = renderHook(() => useAuth())
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user).toEqual({ id: 'u1', email: 'a@x' })
  })

  it('checks the session once on mount', () => {
    renderHook(() => useAuth())
    expect(authStore.authStore.ensureSessionChecked).toHaveBeenCalledOnce()
  })

  it('re-renders with the new state when the store notifies', () => {
    let listener: () => void = () => undefined
    authStore.authStore.subscribe.mockImplementation(l => {
      listener = l
      return vi.fn()
    })
    const { result } = renderHook(() => useAuth())
    expect(result.current.isAuthenticated).toBe(false)

    authStore.authStore.getState.mockReturnValue({
      user: { id: 'u1', email: 'a@x' },
      isAuthenticated: true,
      isLoading: false,
    })
    act(() => listener())

    expect(result.current.isAuthenticated).toBe(true)
  })

  it('unsubscribes from the store on unmount', () => {
    const unsubscribe = vi.fn()
    authStore.authStore.subscribe.mockReturnValue(unsubscribe)
    const { unmount } = renderHook(() => useAuth())

    unmount()

    expect(unsubscribe).toHaveBeenCalledOnce()
  })

  it('logout delegates to the store', async () => {
    const { result } = renderHook(() => useAuth())
    await act(async () => {
      await result.current.logout()
    })
    expect(authStore.authStore.logout).toHaveBeenCalledOnce()
  })

  it('refresh delegates to the store', async () => {
    const { result } = renderHook(() => useAuth())
    await act(async () => {
      await result.current.refresh()
    })
    expect(authStore.authStore.refresh).toHaveBeenCalledOnce()
  })
})
