import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockFindFirst = vi.fn()
const mockCreate = vi.fn()
const mockAdapter = { findFirst: mockFindFirst, create: mockCreate }

vi.mock('../../../core/dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { installPackage } from './install-package'

describe('installPackage', () => {
  beforeEach(() => {
    mockFindFirst.mockReset()
    mockCreate.mockReset()
  })

  it('creates package when not installed', async () => {
    mockFindFirst.mockResolvedValue(null)

    await installPackage({
      packageId: 'pkg_one',
      installedAt: 1234,
      version: '1.2.3',
      enabled: true,
    })

    expect(mockFindFirst).toHaveBeenCalledWith('InstalledPackage', {
      where: { packageId: 'pkg_one' },
    })
    expect(mockCreate).toHaveBeenCalledWith('InstalledPackage', {
      packageId: 'pkg_one',
      installedAt: BigInt(1234),
      version: '1.2.3',
      enabled: true,
    })
  })

  it('does not create when already installed', async () => {
    mockFindFirst.mockResolvedValue({ packageId: 'pkg_one' })

    await installPackage({
      packageId: 'pkg_one',
      installedAt: 1234,
      version: '1.2.3',
      enabled: true,
    })

    expect(mockCreate).not.toHaveBeenCalled()
  })
})
