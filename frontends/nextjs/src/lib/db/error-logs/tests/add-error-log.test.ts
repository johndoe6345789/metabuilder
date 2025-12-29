import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockCreate = vi.fn()
const mockAdapter = { create: mockCreate }

vi.mock('../../core/dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { addErrorLog } from '../crud/add-error-log'

describe('addErrorLog', () => {
  beforeEach(() => {
    mockCreate.mockReset()
  })

  it.each([
    {
      name: 'minimal error log',
      log: {
        timestamp: Date.now(),
        level: 'error' as const,
        message: 'Test error',
        resolved: false,
      },
    },
    {
      name: 'complete error log',
      log: {
        timestamp: Date.now(),
        level: 'error' as const,
        message: 'Test error',
        stack: 'Error: Test error\n  at test.ts:10',
        context: '{"key":"value"}',
        userId: 'user_1',
        username: 'testuser',
        tenantId: 'tenant_1',
        source: 'test.ts',
        resolved: false,
      },
    },
  ])('should add $name', async ({ log }) => {
    mockCreate.mockResolvedValue(undefined)

    const id = await addErrorLog(log)

    expect(mockCreate).toHaveBeenCalledWith(
      'ErrorLog',
      expect.objectContaining({
        id: expect.stringContaining('error_'),
        timestamp: expect.any(BigInt),
        level: log.level,
        message: log.message,
        resolved: false,
      })
    )
    expect(id).toMatch(/^error_/)
  })
})
