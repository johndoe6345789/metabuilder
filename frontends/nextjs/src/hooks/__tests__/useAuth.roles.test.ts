import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock Prisma client to prevent instantiation errors in test environment
vi.mock('@/lib/config/prisma', () => ({
  prisma: {},
}))

// Mock the DBAL adapter to prevent Prisma dependency
vi.mock('@/lib/dbal-client/adapter/get-adapter', () => ({
  getAdapter: vi.fn(() => ({})),
}))

vi.mock('@/lib/auth/api/fetch-session', () => ({
  fetchSession: vi.fn(),
}))

vi.mock('@/lib/auth/api/login', () => ({
  login: vi.fn(),
}))

vi.mock('@/lib/auth/api/logout', () => ({
  logout: vi.fn(),
}))

import { useAuth } from '@/hooks/useAuth'
import { fetchSession } from '@/lib/auth/api/fetch-session'
import { login as loginRequest } from '@/lib/auth/api/login'
import { logout as logoutRequest } from '@/lib/auth/api/logout'
import type { User } from '@/lib/level-types'

const mockFetchSession = vi.mocked(fetchSession)
const mockLogin = vi.mocked(loginRequest)
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

describe('useAuth role mapping', () => {
  beforeEach(async () => {
    mockFetchSession.mockReset()
    mockLogin.mockReset()
    mockLogout.mockReset()
    mockFetchSession.mockResolvedValue(null)
    mockLogout.mockResolvedValue(undefined)

    await resetAuthStore()
  })

  it.each([
    { role: 'public', expectedLevel: 0 },
    { role: 'user', expectedLevel: 1 },
    { role: 'admin', expectedLevel: 3 },
    { role: 'supergod', expectedLevel: 5 },
    { role: 'unknown', expectedLevel: 0 },
  ])('applies level for role "$role"', async ({ role, expectedLevel }) => {
    const { result, unmount } = renderHook(() => useAuth())

    mockLogin.mockResolvedValue({
      success: true,
      user: createUser({ role }),
    })

    await waitForIdle(result)
    await act(async () => {
      await result.current.login('alice@example.com', 'password')
    })

    expect(result.current.user?.level).toBe(expectedLevel)

    unmount()
  })

  it('maps refreshed session roles to levels', async () => {
    const { result, unmount } = renderHook(() => useAuth())

    mockFetchSession.mockResolvedValue(createUser({ role: 'moderator' }))

    await act(async () => {
      await result.current.refresh()
    })
    await waitForIdle(result)

    expect(result.current.user?.level).toBe(2)

    unmount()
  })
})
