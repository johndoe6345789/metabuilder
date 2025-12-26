import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockDelete = vi.fn()
const mockAdapter = { delete: mockDelete }

vi.mock('../dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { deletePackageData } from './delete-package-data'

describe('deletePackageData', () => {
  beforeEach(() => {
    mockDelete.mockReset()
  })

  it('deletes package data by packageId', async () => {
    await deletePackageData('pkg_one')

    expect(mockDelete).toHaveBeenCalledWith('PackageData', 'pkg_one')
  })
})
