import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockDelete = vi.fn()
const mockAdapter = { delete: mockDelete }

vi.mock('../../core/dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { deleteLuaScript } from './delete-lua-script'

describe('deleteLuaScript', () => {
  beforeEach(() => {
    mockDelete.mockReset()
  })

  it.each([{ id: 'ls1' }, { id: 'ls2' }])('should delete $id', async ({ id }) => {
    mockDelete.mockResolvedValue(undefined)

    await deleteLuaScript(id)

    expect(mockDelete).toHaveBeenCalledWith('LuaScript', id)
  })
})
