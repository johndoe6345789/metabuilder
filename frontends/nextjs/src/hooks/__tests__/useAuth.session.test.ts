import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAuth } from '@/hooks/useAuth'
import { fetchSession } from '@/lib/auth/api/fetch-session'
import { login as loginRequest } from '@/lib/auth/api/login'
import { logout as logoutRequest } from '@/lib/auth/api/logout'
import { register as registerRequest } from '@/lib/auth/api/register'
import type { User } from '@/lib/level-types'

// Simple waitFor implementation
const waitFor = async (callback: () => boolean | void, timeout = 1000) => {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    try {
      const result = callback()
      if (result === false) continue
      return
    } catch {
      await new Promise(resolve => setTimeout(resolve, 50))
    }
  }
  throw new Error('waitFor timed out')
}

vi.mock('@/lib/auth/api/fetch-session', () => ({
  fetchSession: vi.fn(),
}))

vi.mock('@/lib/auth/api/login', () => ({
  login: vi.fn(),
}))

vi.mock('@/lib/auth/api/register', () => ({
  register: vi.fn(),
}))

vi.mock('@/lib/auth/api/logout', () => ({
  logout: vi.fn(),
}))

const mockFetchSession = vi.mocked(fetchSession)
const mockLogin = vi.mocked(loginRequest)
const mockRegister = vi.mocked(registerRequest)
const mockLogout = vi.mocked(logoutRequest)

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

const resetAuthStore = async () => {
  const { result, unmount } = renderHook(() => useAuth())
  await waitForIdle(result)
  await act(async () => {
    await result.current.logout()
  })
  await waitForIdle(result)
  unmount()
}

describe('useAuth session flows', () => {
  beforeEach(async () => {
    mockFetchSession.mockReset()
    mockLogin.mockReset()
    mockRegister.mockReset()
    mockLogout.mockReset()
    mockFetchSession.mockResolvedValue(null)
    mockLogout.mockResolvedValue(undefined)

    await resetAuthStore()
  })

  it('starts unauthenticated after session check', async () => {
    const { result, unmount } = renderHook(() => useAuth())

    await waitForIdle(result)

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)

    unmount()
  })

  it('authenticates on login', async () => {
    const { result, unmount } = renderHook(() => useAuth())

    mockLogin.mockResolvedValue({
      success: true,
      user: createUser(),
    })

    await waitForIdle(result)
    await act(async () => {
      await result.current.login('alice@example.com', 'password')
    })

    expect(result.current.user).toMatchObject({
      id: 'user_1',
      email: 'alice@example.com',
      username: 'alice',
      level: 1,
    })
    expect(result.current.isAuthenticated).toBe(true)

    unmount()
  })

  it('clears user on logout', async () => {
    const { result, unmount } = renderHook(() => useAuth())

    mockLogin.mockResolvedValue({
      success: true,
      user: createUser(),
    })

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

  it('registers and authenticates', async () => {
    const { result, unmount } = renderHook(() => useAuth())

    mockRegister.mockResolvedValue({
      success: true,
      user: createUser({
        id: 'user_2',
        username: 'newbie',
        email: 'newbie@example.com',
      }),
    })

    await waitForIdle(result)
    await act(async () => {
      await result.current.register('newbie', 'newbie@example.com', 'password')
    })

    expect(result.current.user).toMatchObject({
      id: 'user_2',
      email: 'newbie@example.com',
      username: 'newbie',
      level: 1,
    })
    expect(result.current.isAuthenticated).toBe(true)

    unmount()
  })

  it('syncs state across hooks', async () => {
    const first = renderHook(() => useAuth())
    const second = renderHook(() => useAuth())

    mockLogin.mockResolvedValue({
      success: true,
      user: createUser({ email: 'sync@example.com', username: 'sync' }),
    })

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
