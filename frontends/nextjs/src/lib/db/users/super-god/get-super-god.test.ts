import { beforeEach,describe, expect, it, vi } from 'vitest'

const mockList = vi.fn()
const mockAdapter = { list: mockList }

vi.mock('../../core/dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { getSuperGod } from './get-super-god'

describe('getSuperGod', () => {
  beforeEach(() => {
    mockList.mockReset()
  })

  it.each([
    {
      name: 'null when no instance owner',
      dbData: [],
      expected: null,
    },
    {
      name: 'supergod user when found',
      dbData: [
        {
          id: 'user_sg',
          username: 'supergod',
          email: 'sg@example.com',
          role: 'supergod',
          profilePicture: null,
          bio: 'Supreme admin',
          createdAt: BigInt(1000),
          tenantId: null,
          isInstanceOwner: true,
        },
      ],
      expected: {
        id: 'user_sg',
        username: 'supergod',
        email: 'sg@example.com',
        role: 'supergod',
        profilePicture: undefined,
        bio: 'Supreme admin',
        createdAt: 1000,
        tenantId: undefined,
        isInstanceOwner: true,
      },
    },
  ])('should return $name', async ({ dbData, expected }) => {
    mockList.mockResolvedValue({ data: dbData })

    const result = await getSuperGod()

    expect(mockList).toHaveBeenCalledWith('User', { filter: { isInstanceOwner: true } })
    expect(result).toEqual(expected)
  })
})
