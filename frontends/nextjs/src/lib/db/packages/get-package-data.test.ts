import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFindFirst = vi.fn()
const mockAdapter = { findFirst: mockFindFirst }

vi.mock('../dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { getPackageData } from './get-package-data'

describe('getPackageData', () => {
  beforeEach(() => {
    mockFindFirst.mockReset()
  })

  it('returns empty object when no data exists', async () => {
    mockFindFirst.mockResolvedValue(null)

    const result = await getPackageData('pkg_one')

    expect(mockFindFirst).toHaveBeenCalledWith('PackageData', { where: { packageId: 'pkg_one' } })
    expect(result).toEqual({})
  })

  it('parses stored JSON data', async () => {
    mockFindFirst.mockResolvedValue({ data: '{"users":[{"id":"1"}]}' })

    const result = await getPackageData('pkg_one')

    expect(result).toEqual({ users: [{ id: '1' }] })
  })
})
