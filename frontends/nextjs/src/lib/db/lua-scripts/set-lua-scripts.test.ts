import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockList = vi.fn()
const mockDelete = vi.fn()
const mockCreate = vi.fn()
const mockAdapter = { list: mockList, delete: mockDelete, create: mockCreate }

vi.mock('../dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { setLuaScripts } from './set-lua-scripts'

describe('setLuaScripts', () => {
  beforeEach(() => {
    mockList.mockReset()
    mockDelete.mockReset()
    mockCreate.mockReset()
  })

  it('should replace all scripts', async () => {
    mockList.mockResolvedValue({ data: [{ id: 'old' }] })
    mockDelete.mockResolvedValue(undefined)
    mockCreate.mockResolvedValue(undefined)

    await setLuaScripts([
      {
        id: 'new',
        name: 'New',
        code: 'return 1',
        parameters: [],
        allowedGlobals: ['math'],
        timeoutMs: 1500,
      },
    ] as any)

    expect(mockDelete).toHaveBeenCalledTimes(1)
    expect(mockCreate).toHaveBeenCalledTimes(1)
  })
})
