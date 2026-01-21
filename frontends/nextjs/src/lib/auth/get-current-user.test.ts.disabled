/**
 * Tests for getCurrentUser function
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock server-only first
vi.mock('server-only', () => ({}))

// Mock dependencies
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))

vi.mock('@/lib/db/sessions', () => ({
  getSessionByToken: vi.fn(),
}))

vi.mock('@/lib/db/core/dbal-client', () => ({
  getAdapter: vi.fn(),
}))

vi.mock('@/lib/db/users/map-user-record', () => ({
  mapUserRecord: vi.fn(),
}))

import { getCurrentUser } from './get-current-user'
import { cookies } from 'next/headers'
import { getSessionByToken } from '@/lib/db/sessions'
import { getAdapter } from '@/lib/db/core/dbal-client'
import { mapUserRecord } from '@/lib/db/users/map-user-record'

describe('getCurrentUser', () => {
  const mockCookies = vi.mocked(cookies)
  const mockGetSessionByToken = vi.mocked(getSessionByToken)
  const mockGetAdapter = vi.mocked(getAdapter)
  const mockMapUserRecord = vi.mocked(mapUserRecord)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it.each([
    {
      scenario: 'no session cookie',
      sessionToken: undefined,
      expected: null,
    },
    {
      scenario: 'empty session cookie',
      sessionToken: '',
      expected: null,
    },
  ])('should return null when $scenario', async ({ sessionToken, expected }) => {
    mockCookies.mockResolvedValue({
      get: vi.fn().mockReturnValue((sessionToken !== null && sessionToken !== undefined && sessionToken.length > 0) ? { value: sessionToken } : undefined),
    } as never)

    const result = await getCurrentUser()
    expect(result).toBe(expected)
  })

  it('should return null when session is expired', async () => {
    mockCookies.mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: 'valid-token' }),
    } as never)

    mockGetSessionByToken.mockResolvedValue(null)

    const result = await getCurrentUser()
    expect(result).toBe(null)
  })

  it('should return null when user not found', async () => {
    mockCookies.mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: 'valid-token' }),
    } as never)

    mockGetSessionByToken.mockResolvedValue({
      id: 'session-1',
      userId: 'user-1',
      token: 'valid-token',
      expiresAt: Date.now() + 10000,
      createdAt: Date.now(),
      lastActivity: Date.now(),
    })

    const mockAdapter = {
      get: vi.fn().mockResolvedValue({ data: null }),
    }
    mockGetAdapter.mockReturnValue(mockAdapter as never)

    const result = await getCurrentUser()
    expect(result).toBe(null)
  })

  it.each([
    {
      role: 'public',
      expectedLevel: 0,
    },
    {
      role: 'user',
      expectedLevel: 1,
    },
    {
      role: 'moderator',
      expectedLevel: 2,
    },
    {
      role: 'admin',
      expectedLevel: 3,
    },
    {
      role: 'god',
      expectedLevel: 4,
    },
    {
      role: 'supergod',
      expectedLevel: 5,
    },
  ])('should return user with level $expectedLevel for role $role', async ({ role, expectedLevel }) => {
    const mockUser = {
      id: 'user-1',
      username: 'testuser',
      email: 'test@example.com',
      role,
      createdAt: Date.now(),
      tenantId: 'tenant-1',
      isInstanceOwner: false,
    }

    mockCookies.mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: 'valid-token' }),
    } as never)

    mockGetSessionByToken.mockResolvedValue({
      id: 'session-1',
      userId: 'user-1',
      token: 'valid-token',
      expiresAt: Date.now() + 10000,
      createdAt: Date.now(),
      lastActivity: Date.now(),
    })

    const mockAdapter = {
      get: vi.fn().mockResolvedValue({ data: mockUser }),
    }
    mockGetAdapter.mockReturnValue(mockAdapter as never)
    mockMapUserRecord.mockReturnValue(mockUser as never)

    const result = await getCurrentUser()

    expect(result).not.toBe(null)
    expect(result?.level).toBe(expectedLevel)
    expect(result?.role).toBe(role)
    expect(result?.username).toBe('testuser')
  })

  it('should return null on error and log it', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    mockCookies.mockRejectedValue(new Error('Cookie error'))

    const result = await getCurrentUser()
    expect(result).toBe(null)
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error getting current user:',
      expect.any(Error)
    )

    consoleErrorSpy.mockRestore()
  })
})
