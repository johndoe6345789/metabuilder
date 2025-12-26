import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockList = vi.fn()
const mockAdapter = { list: mockList }

vi.mock('../dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { getWorkflows } from './get-workflows'

describe('getWorkflows', () => {
  beforeEach(() => {
    mockList.mockReset()
  })

  it.each([
    { name: 'empty', dbData: [], expectedLength: 0 },
    {
      name: 'parsed workflows',
      dbData: [{ id: 'w1', name: 'Test', description: null, nodes: '[]', edges: '[]', enabled: true }],
      expectedLength: 1,
    },
  ])('should return $name', async ({ dbData, expectedLength }) => {
    mockList.mockResolvedValue({ data: dbData })

    const result = await getWorkflows()

    expect(result).toHaveLength(expectedLength)
  })
})
