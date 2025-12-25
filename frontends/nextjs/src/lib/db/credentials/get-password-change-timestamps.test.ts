import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockList = vi.fn()
const mockAdapter = { list: mockList }

vi.mock('../dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { getPasswordChangeTimestamps } from './get-password-change-timestamps'

describe('getPasswordChangeTimestamps', () => {
  beforeEach(() => {
    mockList.mockReset()
  })

  it.each([
    {
      name: 'empty object when no users',
      dbData: [],
      expected: {},
    },
    {
      name: 'empty object when users have no timestamps',
      dbData: [
        { username: 'user1', passwordChangeTimestamp: null },
        { username: 'user2', passwordChangeTimestamp: null },
      ],
      expected: {},
    },
    {
      name: 'timestamps for users that have them',
      dbData: [
        { username: 'user1', passwordChangeTimestamp: BigInt(1000) },
        { username: 'user2', passwordChangeTimestamp: null },
        { username: 'user3', passwordChangeTimestamp: BigInt(2000) },
      ],
      expected: { user1: 1000, user3: 2000 },
    },
  ])('should return $name', async ({ dbData, expected }) => {
    mockList.mockResolvedValue({ data: dbData })

    const result = await getPasswordChangeTimestamps()

    expect(mockList).toHaveBeenCalledWith('User')
    expect(result).toEqual(expected)
  })
})
