import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockList = vi.fn()
const mockAdapter = { list: mockList }

vi.mock('../dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { getLuaScripts } from './get-lua-scripts'

describe('getLuaScripts', () => {
  beforeEach(() => {
    mockList.mockReset()
  })

  it.each([
    { name: 'empty', dbData: [], expectedLength: 0 },
    {
      name: 'parsed scripts',
      dbData: [{ id: 'ls1', name: 'Test', description: null, code: 'return 1', parameters: '[]', returnType: null }],
      expectedLength: 1,
    },
  ])('should return $name', async ({ dbData, expectedLength }) => {
    mockList.mockResolvedValue({ data: dbData })

    const result = await getLuaScripts()

    expect(result).toHaveLength(expectedLength)
  })
})
