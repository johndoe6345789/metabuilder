import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockList = vi.fn()
const mockAdapter = { list: mockList }

vi.mock('../../core/dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { getComments } from './get-comments'

describe('getComments', () => {
  beforeEach(() => {
    mockList.mockReset()
  })

  it.each([
    { name: 'empty array', dbData: [], expectedLength: 0 },
    {
      name: 'parsed comments',
      dbData: [
        {
          id: 'c1',
          userId: 'u1',
          content: 'Hi',
          createdAt: BigInt(1000),
          updatedAt: null,
          parentId: null,
        },
      ],
      expectedLength: 1,
    },
  ])('should return $name', async ({ dbData, expectedLength }) => {
    mockList.mockResolvedValue({ data: dbData })

    const result = await getComments()

    expect(mockList).toHaveBeenCalledWith('Comment')
    expect(result).toHaveLength(expectedLength)
  })
})
