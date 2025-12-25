import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockCreate = vi.fn()
const mockAdapter = { create: mockCreate }

vi.mock('../dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { addLuaScript } from './add-lua-script'

describe('addLuaScript', () => {
  beforeEach(() => {
    mockCreate.mockReset()
  })

  it.each([
    {
      name: 'basic script',
      script: { id: 'ls1', name: 'Test', code: 'return 1', parameters: [] },
    },
    {
      name: 'script with parameters',
      script: { id: 'ls2', name: 'Calc', code: 'return a + b', parameters: [{ name: 'a' }, { name: 'b' }], returnType: 'number' },
    },
  ])('should add $name', async ({ script }) => {
    mockCreate.mockResolvedValue(undefined)

    await addLuaScript(script as any)

    expect(mockCreate).toHaveBeenCalledWith('LuaScript', expect.objectContaining({
      id: script.id,
      name: script.name,
      code: script.code,
    }))
  })
})
