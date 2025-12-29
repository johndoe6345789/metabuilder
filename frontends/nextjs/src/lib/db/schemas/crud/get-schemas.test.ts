import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockList = vi.fn()
const mockAdapter = { list: mockList }

vi.mock('../../core/dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { getSchemas } from './get-schemas'

describe('getSchemas', () => {
  beforeEach(() => {
    mockList.mockReset()
  })

  it.each([
    { name: 'empty', dbData: [], expectedLength: 0 },
    {
      name: 'parsed schemas',
      dbData: [
        {
          name: 'User',
          label: null,
          labelPlural: null,
          icon: null,
          fields: '[]',
          listDisplay: null,
          listFilter: null,
          searchFields: null,
          ordering: null,
        },
      ],
      expectedLength: 1,
    },
  ])('should return $name', async ({ dbData, expectedLength }) => {
    mockList.mockResolvedValue({ data: dbData })

    const result = await getSchemas()

    expect(result).toHaveLength(expectedLength)
  })
})
