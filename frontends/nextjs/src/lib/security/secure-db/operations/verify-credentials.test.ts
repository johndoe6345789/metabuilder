import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { SecurityContext } from '../types'
import {
  loginAttemptTracker,
  DEFAULT_AUTH_LOCKOUT_MAX_ATTEMPTS,
} from '../login-attempt-tracker'

vi.mock('../execute-query', () => ({
  executeQuery: vi.fn(),
}))

import { verifyCredentials } from './verify-credentials'
import { executeQuery } from '../execute-query'

const mockExecuteQuery = vi.mocked(executeQuery)

const createContext = (): SecurityContext => ({
  user: {
    id: 'user_1',
    username: 'user',
    email: 'user@example.com',
    role: 'user',
    createdAt: 0,
  },
})

describe('verifyCredentials', () => {
  beforeEach(() => {
    loginAttemptTracker.reset()
    mockExecuteQuery.mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('blocks attempts when user is locked out', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(0))

    for (let i = 0; i < DEFAULT_AUTH_LOCKOUT_MAX_ATTEMPTS; i += 1) {
      loginAttemptTracker.registerFailure('user')
    }

    mockExecuteQuery.mockResolvedValue(true)

    const result = await verifyCredentials(createContext(), 'user', 'pass')

    expect(result).toBe(false)
    expect(mockExecuteQuery).not.toHaveBeenCalled()
  })

  it('locks out after repeated failures', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(0))

    mockExecuteQuery.mockResolvedValue(false)

    for (let i = 0; i < DEFAULT_AUTH_LOCKOUT_MAX_ATTEMPTS; i += 1) {
      const result = await verifyCredentials(createContext(), 'user', 'pass')
      expect(result).toBe(false)
    }

    expect(loginAttemptTracker.isLocked('user')).toBe(true)

    mockExecuteQuery.mockReset()

    const blocked = await verifyCredentials(createContext(), 'user', 'pass')

    expect(blocked).toBe(false)
    expect(mockExecuteQuery).not.toHaveBeenCalled()
  })

  it('clears failure state after success', async () => {
    mockExecuteQuery
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true)

    const first = await verifyCredentials(createContext(), 'user', 'pass')
    expect(first).toBe(false)
    expect(loginAttemptTracker.getState('user')).not.toBeNull()

    const second = await verifyCredentials(createContext(), 'user', 'pass')
    expect(second).toBe(true)
    expect(loginAttemptTracker.getState('user')).toBeNull()
  })
})
