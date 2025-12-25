import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAuth } from '@/hooks/useAuth'

describe('useAuth', () => {
  const completeAuthAction = async (action: () => Promise<void>) => {
    await act(async () => {
      const promise = action()
      vi.advanceTimersByTime(100)
      await promise
    })
  }

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  beforeEach(async () => {
    const { result, unmount } = renderHook(() => useAuth())
    await completeAuthAction(() => result.current.logout())
    unmount()
  })

  it('should start unauthenticated', () => {
    const { result, unmount } = renderHook(() => useAuth())

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.isLoading).toBe(false)

    unmount()
  })

  it.each([
    { email: 'alice@example.com', expectedName: 'alice' },
    { email: 'bob.smith@corp.io', expectedName: 'bob.smith' },
  ])('should authenticate $email', async ({ email, expectedName }) => {
    const { result, unmount } = renderHook(() => useAuth())

    await completeAuthAction(() => result.current.login(email, 'password'))

    expect(result.current.user).toMatchObject({
      id: '1',
      email,
      name: expectedName,
    })
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.isLoading).toBe(false)

    unmount()
  })

  it('should clear user on logout', async () => {
    const { result, unmount } = renderHook(() => useAuth())

    await completeAuthAction(() => result.current.login('logout@example.com', 'password'))
    await completeAuthAction(() => result.current.logout())

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.isLoading).toBe(false)

    unmount()
  })

  it('should sync state across hooks', async () => {
    const first = renderHook(() => useAuth())
    const second = renderHook(() => useAuth())

    await completeAuthAction(() => first.result.current.login('sync@example.com', 'password'))

    expect(second.result.current.isAuthenticated).toBe(true)
    expect(second.result.current.user?.email).toBe('sync@example.com')

    await completeAuthAction(() => second.result.current.logout())

    expect(first.result.current.isAuthenticated).toBe(false)
    expect(first.result.current.user).toBeNull()

    first.unmount()
    second.unmount()
  })
})
