import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mockList = vi.fn()
const mockDelete = vi.fn()
const mockAdapter = { list: mockList, delete: mockDelete }

vi.mock('../../core/dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { getSessionByToken } from './get-session-by-token'

describe('getSessionByToken', () => {
  beforeEach(() => {
    mockList.mockReset()
    mockDelete.mockReset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns null when no session exists', async () => {
    mockList.mockResolvedValue({ data: [] })

    const result = await getSessionByToken('token')

    expect(mockList).toHaveBeenCalledWith('Session', { filter: { token: 'token' } })
    expect(result).toBeNull()
  })

  it('returns session when not expired', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(1000)
    mockList.mockResolvedValue({
      data: [
        {
          id: 'session_1',
          userId: 'user_1',
          token: 'token',
          expiresAt: BigInt(2000),
          createdAt: BigInt(500),
          lastActivity: BigInt(900),
        },
      ],
    })

    const result = await getSessionByToken('token')

    expect(result).toEqual({
      id: 'session_1',
      userId: 'user_1',
      token: 'token',
      expiresAt: 2000,
      createdAt: 500,
      lastActivity: 900,
    })
    expect(mockDelete).not.toHaveBeenCalled()
  })

  it('deletes and returns null when expired', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(3000)
    mockList.mockResolvedValue({
      data: [
        {
          id: 'session_2',
          userId: 'user_2',
          token: 'expired',
          expiresAt: BigInt(2000),
          createdAt: BigInt(1000),
          lastActivity: BigInt(1500),
        },
      ],
    })

    const result = await getSessionByToken('expired')

    expect(result).toBeNull()
    expect(mockDelete).toHaveBeenCalledWith('Session', 'session_2')
  })
})
