import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockDelete = vi.fn()
const mockAdapter = { delete: mockDelete }

vi.mock('../dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { uninstallPackage } from './uninstall-package'

describe('uninstallPackage', () => {
  beforeEach(() => {
    mockDelete.mockReset()
  })

  it('deletes installed package record', async () => {
    await uninstallPackage('pkg_one')

    expect(mockDelete).toHaveBeenCalledWith('InstalledPackage', 'pkg_one')
  })
})
