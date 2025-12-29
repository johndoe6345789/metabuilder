import { beforeEach,describe, expect, it, vi } from 'vitest'

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
          tenantId: 'tenant_1',
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
          tenantId: 'tenant_1',
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
          tenantId: 'tenant_1',
          source: null,
          resolved: false,
          resolvedAt: null,
          resolvedBy: null,
        },
      ],
      options: { level: 'error' },
      expectedLength: 1,
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
        {
          id: 'error_2',
          timestamp: BigInt(Date.now()),
          level: 'error',
          message: 'Tenant 2 error',
          stack: null,
          context: null,
          userId: null,
          username: null,
          tenantId: 'tenant_2',
          source: null,
          resolved: false,
          resolvedAt: null,
          resolvedBy: null,
        },
      ],
      options: { tenantId: 'tenant_1' },
      expectedLength: 1,
    },
  ])('should return $name', async ({ dbData, options, expectedLength }) => {
    mockList.mockResolvedValue({ data: dbData })

    const result = await getErrorLogs(options)

    expect(mockList).toHaveBeenCalledWith('ErrorLog')
    expect(result).toHaveLength(expectedLength)

    if (options?.tenantId && result.length > 0) {
      expect(result.every(log => log.tenantId === options.tenantId)).toBe(true)
    }
  })
})
