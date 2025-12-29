import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockList = vi.fn()
const mockAdapter = { list: mockList }

vi.mock('../../core/dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { getComponentHierarchy } from './get-component-hierarchy'

describe('getComponentHierarchy', () => {
  beforeEach(() => {
    mockList.mockReset()
  })

  it.each([
    { name: 'empty object', dbData: [], expectedKeys: 0 },
    {
      name: 'parsed hierarchy',
      dbData: [
        {
          id: 'node1',
          type: 'Container',
          parentId: null,
          childIds: '["node2"]',
          order: 0,
          pageId: 'p1',
        },
      ],
      expectedKeys: 1,
    },
  ])('should return $name', async ({ dbData, expectedKeys }) => {
    mockList.mockResolvedValue({ data: dbData })

    const result = await getComponentHierarchy()

    expect(Object.keys(result)).toHaveLength(expectedKeys)
  })
})
