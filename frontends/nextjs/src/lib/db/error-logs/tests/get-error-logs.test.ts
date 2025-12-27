import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockList = vi.fn()
const mockAdapter = { list: mockList }

vi.mock('../../core/dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { getErrorLogs } from '../crud/get-error-logs'

describe('getErrorLogs', () => {
  beforeEach(() => {
    mockList.mockReset()
  })

  it.each([
    {
      name: 'empty array when no logs',
      dbData: [],
      options: undefined,
      expectedLength: 0,
    },
    {
      name: 'all error logs',
      dbData: [
        {
          id: 'error_1',
          timestamp: BigInt(Date.now()),
          level: 'error',
          message: 'Test error',
          stack: 'Error: Test error',
          context: null,
          userId: null,
          username: null,
          tenantId: null,
          source: 'test.ts',
          resolved: false,
          resolvedAt: null,
          resolvedBy: null,
        },
      ],
      options: undefined,
      expectedLength: 1,
    },
    {
      name: 'filtered by level',
      dbData: [
        {
          id: 'error_1',
          timestamp: BigInt(Date.now()),
          level: 'error',
          message: 'Test error',
          stack: null,
          context: null,
          userId: null,
          username: null,
          tenantId: null,
          source: null,
          resolved: false,
          resolvedAt: null,
          resolvedBy: null,
        },
        {
          id: 'warning_1',
          timestamp: BigInt(Date.now()),
          level: 'warning',
          message: 'Test warning',
          stack: null,
          context: null,
          userId: null,
          username: null,
          tenantId: null,
          source: null,
          resolved: false,
          resolvedAt: null,
          resolvedBy: null,
        },
      ],
      options: { level: 'error' },
      expectedLength: 1,
    },
  ])('should return $name', async ({ dbData, options, expectedLength }) => {
    mockList.mockResolvedValue({ data: dbData })

    const result = await getErrorLogs(options)

    expect(mockList).toHaveBeenCalledWith('ErrorLog')
    expect(result).toHaveLength(expectedLength)
  })
})
