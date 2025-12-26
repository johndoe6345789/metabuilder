import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import type { User } from '@/lib/level-types'

const mockFetchSession = vi.fn()
const mockLogin = vi.fn()
const mockLogout = vi.fn()

vi.mock('@/lib/auth/api/fetch-session', () => ({
  fetchSession: mockFetchSession,
}))

vi.mock('@/lib/auth/api/login', () => ({
  login: mockLogin,
}))

vi.mock('@/lib/auth/api/logout', () => ({
  logout: mockLogout,
}))

import { useAuth } from '@/hooks/useAuth'

const createUser = (overrides?: Partial<User>): User => ({
  id: 'user_1',
  username: 'alice',
  email: 'alice@example.com',
  role: 'user',
  createdAt: 1000,
  tenantId: undefined,
  profilePicture: undefined,
  bio: undefined,
  isInstanceOwner: false,
  ...overrides,
})

const waitForIdle = async (result: { current: { isLoading: boolean } }) => {
  await waitFor(() => {
    expect(result.current.isLoading).toBe(false)
  })
}

describe('useAuth', () => {
  beforeEach(async () => {
    mockFetchSession.mockReset()
    mockLogin.mockReset()
    mockLogout.mockReset()
    mockFetchSession.mockResolvedValue(null)
    mockLogout.mockResolvedValue(undefined)

    const { result, unmount } = renderHook(() => useAuth())
    await waitForIdle(result)
    await act(async () => {
      await result.current.logout()
    })
    await waitForIdle(result)
    unmount()
  })

  it('should start unauthenticated after session check', async () => {
    const { result, unmount } = renderHook(() => useAuth())

    await waitForIdle(result)

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)

    unmount()
  })

  it.each([
    { email: 'alice@example.com', expectedName: 'alice' },
    { email: 'bob.smith@corp.io', expectedName: 'bob.smith' },
  ])('should authenticate $email', async ({ email, expectedName }) => {
    const { result, unmount } = renderHook(() => useAuth())

    mockLogin.mockResolvedValue(createUser({
      id: 'user_1',
      username: expectedName,
      email,
    }))

    await waitForIdle(result)
    await act(async () => {
      await result.current.login(email, 'password')
    })

    expect(result.current.user).toMatchObject({
      id: 'user_1',
      email,
      name: expectedName,
      username: expectedName,
      level: 2,
    })
    expect(result.current.isAuthenticated).toBe(true)

    unmount()
  })

  it('should clear user on logout', async () => {
    const { result, unmount } = renderHook(() => useAuth())

    mockLogin.mockResolvedValue(createUser())

    await waitForIdle(result)
    await act(async () => {
      await result.current.login('alice@example.com', 'password')
    })

    await act(async () => {
      await result.current.logout()
    })

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)

    unmount()
  })

  it('should sync state across hooks', async () => {
    const first = renderHook(() => useAuth())
    const second = renderHook(() => useAuth())

    mockLogin.mockResolvedValue(createUser({ email: 'sync@example.com', username: 'sync' }))

    await waitForIdle(first.result)
    await waitForIdle(second.result)

    await act(async () => {
      await first.result.current.login('sync@example.com', 'password')
    })

    expect(second.result.current.isAuthenticated).toBe(true)
    expect(second.result.current.user?.email).toBe('sync@example.com')

    await act(async () => {
      await second.result.current.logout()
    })

    expect(first.result.current.isAuthenticated).toBe(false)
    expect(first.result.current.user).toBeNull()

    first.unmount()
    second.unmount()
  })
})
