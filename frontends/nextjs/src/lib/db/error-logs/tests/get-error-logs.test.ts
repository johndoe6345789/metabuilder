import { beforeEach, describe, expect, it, vi } from 'vitest'

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
      expectedFilter: undefined,
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
          tenantId: 'tenant_1',
          source: 'test.ts',
          resolved: false,
          resolvedAt: null,
          resolvedBy: null,
        },
      ],
      options: undefined,
      expectedFilter: undefined,
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
          tenantId: 'tenant_1',
          source: null,
          resolved: false,
          resolvedAt: null,
          resolvedBy: null,
        },
      ],
      options: { level: 'error' },
      expectedFilter: { level: 'error' },
    },
    {
      name: 'filtered by tenantId',
      dbData: [
        {
          id: 'error_1',
          timestamp: BigInt(Date.now()),
          level: 'error',
          message: 'Tenant 1 error',
          stack: null,
          context: null,
          userId: null,
          username: null,
          tenantId: 'tenant_1',
          source: null,
          resolved: false,
          resolvedAt: null,
          resolvedBy: null,
        },
      ],
      options: { tenantId: 'tenant_1' },
      expectedFilter: { tenantId: 'tenant_1' },
    },
  ])('should return $name', async ({ dbData, options, expectedFilter }) => {
    mockList.mockResolvedValue({ data: dbData })

    const result = await getErrorLogs(options)

    // Verify list was called with correct options
    const expectedLimit = options && 'limit' in options ? options.limit : undefined
    expect(mockList).toHaveBeenCalledWith('ErrorLog', {
      filter: expectedFilter,
      orderBy: [{ timestamp: 'desc' }],
      take: expectedLimit ?? undefined,
    })
    expect(result).toHaveLength(dbData.length)

    if (options?.tenantId !== null && options?.tenantId !== undefined && result.length > 0) {
      expect(result.every(log => log.tenantId === options.tenantId)).toBe(true)
    }
  })
})
