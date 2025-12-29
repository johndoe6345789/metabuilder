import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockCreate = vi.fn()
const mockAdapter = { create: mockCreate }

vi.mock('../../../core/dbal-client', () => ({
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
      script: {
        id: 'ls2',
        name: 'Calc',
        code: 'return a + b',
        parameters: [{ name: 'a' }, { name: 'b' }],
        returnType: 'number',
      },
    },
    {
      name: 'script with sandbox profile',
      script: {
        id: 'ls3',
        name: 'Sandboxed',
        code: 'return math.sqrt(9)',
        parameters: [],
        isSandboxed: true,
        allowedGlobals: ['math'],
        timeoutMs: 2500,
      },
    },
  ])('should add $name', async ({ script }) => {
    mockCreate.mockResolvedValue(undefined)

    await addLuaScript(script as any)

    const payload = mockCreate.mock.calls[0]?.[1] as Record<string, unknown>

    expect(mockCreate).toHaveBeenCalledWith(
      'LuaScript',
      expect.objectContaining({
        id: script.id,
        name: script.name,
        code: script.code,
      })
    )

    if (script.allowedGlobals) {
      expect(payload.allowedGlobals).toContain('math')
      expect(payload.timeoutMs).toBe(script.timeoutMs)
    }
  })
})
