import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockList = vi.fn()
const mockAdapter = { list: mockList }

vi.mock('../core/dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { getAppConfig } from './get-app-config'

describe('getAppConfig', () => {
  beforeEach(() => {
    mockList.mockReset()
  })

  it.each([
    { name: 'null when empty', dbData: [], expected: null },
    {
      name: 'parsed config',
      dbData: [
        {
          id: 'app1',
          name: 'Test App',
          schemas: '[]',
          workflows: '[]',
          pages: '[]',
          theme: '{}',
        },
      ],
      expected: { id: 'app1', name: 'Test App' },
    },
  ])('should return $name', async ({ dbData, expected }) => {
    mockList.mockResolvedValue({ data: dbData })

    const result = await getAppConfig()

    if (expected !== null && expected !== undefined) {
      expect(result).toMatchObject(expected)
    } else {
      expect(result).toBeNull()
    }
  })
})
