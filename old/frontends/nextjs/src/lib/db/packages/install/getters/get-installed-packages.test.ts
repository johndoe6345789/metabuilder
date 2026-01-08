import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockList = vi.fn()
const mockAdapter = { list: mockList }

vi.mock('../../../core/dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { getInstalledPackages } from './get-installed-packages'

describe('getInstalledPackages', () => {
  beforeEach(() => {
    mockList.mockReset()
  })

  it('returns mapped installed packages', async () => {
    mockList.mockResolvedValue({
      data: [
        { packageId: 'pkg_one', installedAt: BigInt(100), version: '1.0.0', enabled: true },
        { packageId: 'pkg_two', installedAt: BigInt(200), version: '2.0.0', enabled: false },
      ],
    })

    const result = await getInstalledPackages()

    expect(mockList).toHaveBeenCalledWith('InstalledPackage')
    expect(result).toEqual([
      { packageId: 'pkg_one', installedAt: 100, version: '1.0.0', enabled: true },
      { packageId: 'pkg_two', installedAt: 200, version: '2.0.0', enabled: false },
    ])
  })
})
