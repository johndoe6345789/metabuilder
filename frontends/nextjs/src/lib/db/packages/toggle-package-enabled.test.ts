import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockUpdate = vi.fn()
const mockAdapter = { update: mockUpdate }

vi.mock('../dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { togglePackageEnabled } from './toggle-package-enabled'

describe('togglePackageEnabled', () => {
  beforeEach(() => {
    mockUpdate.mockReset()
  })

  it('updates enabled state for installed package', async () => {
    await togglePackageEnabled('pkg_one', false)

    expect(mockUpdate).toHaveBeenCalledWith('InstalledPackage', 'pkg_one', { enabled: false })
  })
})
