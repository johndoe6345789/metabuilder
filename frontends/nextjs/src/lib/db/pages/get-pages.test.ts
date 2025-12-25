import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockList = vi.fn()
const mockAdapter = { list: mockList }

vi.mock('../dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { getPages } from './get-pages'

describe('getPages', () => {
  beforeEach(() => {
    mockList.mockReset()
  })

  it.each([
    {
      name: 'empty array when no pages',
      dbData: [],
      expectedLength: 0,
    },
    {
      name: 'parsed pages',
      dbData: [
        {
          id: 'page_1',
          path: '/home',
          title: 'Home',
          level: 1,
          componentTree: '[]',
          requiresAuth: false,
          requiredRole: null,
        },
      ],
      expectedLength: 1,
    },
  ])('should return $name', async ({ dbData, expectedLength }) => {
    mockList.mockResolvedValue({ data: dbData })

    const result = await getPages()

    expect(mockList).toHaveBeenCalledWith('PageConfig')
    expect(result).toHaveLength(expectedLength)
  })
})
