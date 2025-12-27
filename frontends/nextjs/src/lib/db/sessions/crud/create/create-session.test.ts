import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockCreate = vi.fn()
const mockAdapter = { create: mockCreate }

vi.mock('../../../core/dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { createSession } from './create-session'

describe('createSession', () => {
  beforeEach(() => {
    mockCreate.mockReset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('creates a session record with explicit values', async () => {
    const now = 1700000000000
    vi.spyOn(Date, 'now').mockReturnValue(now)

    const result = await createSession({
      id: 'session_1',
      token: 'token_1',
      userId: 'user_1',
      expiresAt: 1700000100000,
      createdAt: 1699990000000,
      lastActivity: 1699990001000,
    })

    expect(mockCreate).toHaveBeenCalledWith('Session', {
      id: 'session_1',
      userId: 'user_1',
      token: 'token_1',
      expiresAt: BigInt(1700000100000),
      createdAt: BigInt(1699990000000),
      lastActivity: BigInt(1699990001000),
    })

    expect(result).toEqual({
      id: 'session_1',
      userId: 'user_1',
      token: 'token_1',
      expiresAt: 1700000100000,
      createdAt: 1699990000000,
      lastActivity: 1699990001000,
    })
  })
})
