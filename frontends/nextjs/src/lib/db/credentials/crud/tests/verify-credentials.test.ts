import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockList = vi.fn()
const mockAdapter = { list: mockList }

vi.mock('../../../core/dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

vi.mock('../verify-password', () => ({
  verifyPassword: vi.fn((password: string, hash: string) => Promise.resolve(password === 'correct' && hash === 'validhash')),
}))

import { verifyCredentials } from './verify-credentials'

describe('verifyCredentials', () => {
  beforeEach(() => {
    mockList.mockReset()
  })

  it.each([
    {
      name: 'false when user not found',
      username: 'nonexistent',
      password: 'any',
      dbData: [],
      expected: false,
    },
    {
      name: 'false when password invalid',
      username: 'user',
      password: 'wrong',
      dbData: [{ username: 'user', passwordHash: 'validhash' }],
      expected: false,
    },
    {
      name: 'true when password valid',
      username: 'user',
      password: 'correct',
      dbData: [{ username: 'user', passwordHash: 'validhash' }],
      expected: true,
    },
  ])('should return $name', async ({ username, password, dbData, expected }) => {
    mockList.mockResolvedValue({ data: dbData })

    const result = await verifyCredentials(username, password)

    expect(mockList).toHaveBeenCalledWith('Credential', { filter: { username } })
    expect(result).toBe(expected)
  })
})
