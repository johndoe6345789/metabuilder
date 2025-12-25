import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockUpdate = vi.fn()
const mockAdapter = { update: mockUpdate }

vi.mock('../dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { updateLuaScript } from './update-lua-script'

describe('updateLuaScript', () => {
  beforeEach(() => {
    mockUpdate.mockReset()
  })

  it.each([
    { id: 'ls1', updates: { name: 'New Name' } },
    { id: 'ls2', updates: { code: 'return 2', description: 'Updated' } },
  ])('should update $id', async ({ id, updates }) => {
    mockUpdate.mockResolvedValue(undefined)

    await updateLuaScript(id, updates as any)

    expect(mockUpdate).toHaveBeenCalledWith('LuaScript', id, expect.any(Object))
  })
})
