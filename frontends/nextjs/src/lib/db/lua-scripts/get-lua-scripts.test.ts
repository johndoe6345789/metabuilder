import { beforeEach,describe, expect, it, vi } from 'vitest'

const mockList = vi.fn()
const mockAdapter = { list: mockList }

vi.mock('../core/dbal-client', () => ({
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
      dbData: [
        {
          id: 'ls1',
          name: 'Test',
          description: null,
          code: 'return 1',
          parameters: '[]',
          returnType: null,
          isSandboxed: true,
          allowedGlobals: '["math","string"]',
          timeoutMs: 3000,
        },
      ],
      expectedLength: 1,
      expectedFirst: {
        id: 'ls1',
        allowedGlobals: ['math', 'string'],
        isSandboxed: true,
        timeoutMs: 3000,
      },
    },
  ])('should return $name', async ({ dbData, expectedLength, expectedFirst }) => {
    mockList.mockResolvedValue({ data: dbData })

    const result = await getLuaScripts()

    expect(result).toHaveLength(expectedLength)
    if (expectedFirst) {
      expect(result[0]).toEqual(expect.objectContaining(expectedFirst))
    }
  })
})
