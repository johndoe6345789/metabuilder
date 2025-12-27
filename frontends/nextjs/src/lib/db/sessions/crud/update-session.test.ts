import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockUpdate = vi.fn()
const mockAdapter = { update: mockUpdate }

vi.mock('../../core/dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { updateSession } from './update-session'

describe('updateSession', () => {
  beforeEach(() => {
    mockUpdate.mockReset()
  })

  it('updates session fields and maps result', async () => {
    mockUpdate.mockResolvedValue({
      id: 'session_1',
      userId: 'user_1',
      token: 'token',
      expiresAt: BigInt(5000),
      createdAt: BigInt(1000),
      lastActivity: BigInt(4000),
    })

    const result = await updateSession('session_1', {
      expiresAt: 5000,
      lastActivity: 4000,
    })

    expect(mockUpdate).toHaveBeenCalledWith('Session', 'session_1', {
      expiresAt: BigInt(5000),
      lastActivity: BigInt(4000),
    })

    expect(result).toEqual({
      id: 'session_1',
      userId: 'user_1',
      token: 'token',
      expiresAt: 5000,
      createdAt: 1000,
      lastActivity: 4000,
    })
  })
})
