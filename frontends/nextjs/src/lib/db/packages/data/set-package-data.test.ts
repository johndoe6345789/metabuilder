import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockUpsert = vi.fn()
const mockAdapter = { upsert: mockUpsert }

vi.mock('../dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { setPackageData } from './set-package-data'

describe('setPackageData', () => {
  beforeEach(() => {
    mockUpsert.mockReset()
  })

  it('upserts package data as JSON', async () => {
    await setPackageData('pkg_one', { users: [{ id: '1' }] })

    expect(mockUpsert).toHaveBeenCalledWith('PackageData', {
      where: { packageId: 'pkg_one' },
      update: { data: '{"users":[{"id":"1"}]}' },
      create: { packageId: 'pkg_one', data: '{"users":[{"id":"1"}]}' },
    })
  })
})
