import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { LuaScript } from '../../types/level-types'

const mockList = vi.fn()
const mockDelete = vi.fn()
const mockCreate = vi.fn()
const mockAdapter = { list: mockList, delete: mockDelete, create: mockCreate }

vi.mock('../core/dbal-client', () => ({
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

    const scripts: LuaScript[] = [
      {
        id: 'new',
        name: 'New',
        code: 'return 1',
        parameters: [],
        allowedGlobals: ['math'],
        timeoutMs: 1500,
      },
    ]

    await setLuaScripts(scripts)

    expect(mockDelete).toHaveBeenCalledTimes(1)
    expect(mockCreate).toHaveBeenCalledTimes(1)
  })
})
