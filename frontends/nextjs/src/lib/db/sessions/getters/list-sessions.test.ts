import { afterEach,beforeEach, describe, expect, it, vi } from 'vitest'

const mockList = vi.fn()
const mockAdapter = { list: mockList }

vi.mock('../../core/dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { listSessions } from './list-sessions'

describe('listSessions', () => {
  beforeEach(() => {
    mockList.mockReset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('filters out expired sessions by default', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(2000)
    mockList.mockResolvedValue({
      data: [
        {
          id: 'session_active',
          userId: 'user_1',
          token: 'active',
          expiresAt: BigInt(3000),
          createdAt: BigInt(1000),
          lastActivity: BigInt(1500),
        },
        {
          id: 'session_expired',
          userId: 'user_1',
          token: 'expired',
          expiresAt: BigInt(1500),
          createdAt: BigInt(900),
          lastActivity: BigInt(1200),
        },
      ],
    })

    const result = await listSessions({ userId: 'user_1' })

    expect(mockList).toHaveBeenCalledWith('Session', { filter: { userId: 'user_1' } })
    expect(result).toEqual([
      {
        id: 'session_active',
        userId: 'user_1',
        token: 'active',
        expiresAt: 3000,
        createdAt: 1000,
        lastActivity: 1500,
      },
    ])
  })

  it('returns expired sessions when includeExpired is true', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(2000)
    mockList.mockResolvedValue({
      data: [
        {
          id: 'session_expired',
          userId: 'user_2',
          token: 'expired',
          expiresAt: BigInt(1500),
          createdAt: BigInt(900),
          lastActivity: BigInt(1200),
        },
      ],
    })

    const result = await listSessions({ includeExpired: true })

    expect(mockList).toHaveBeenCalledWith('Session')
    expect(result).toEqual([
      {
        id: 'session_expired',
        userId: 'user_2',
        token: 'expired',
        expiresAt: 1500,
        createdAt: 900,
        lastActivity: 1200,
      },
    ])
  })
})
