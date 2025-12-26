import { describe, it, expect, beforeEach, vi } from 'vitest'

const { initializePackageSystem } = vi.hoisted(() => ({
  initializePackageSystem: vi.fn(),
}))

vi.mock('@/lib/package-loader', () => ({
  initializePackageSystem,
}))

import { initializePackages } from '@/seed-data/packages'

describe('initializePackages', () => {
  beforeEach(() => {
    initializePackageSystem.mockReset()
  })

  it.each([
    { name: 'resolve when initializer succeeds', error: null as Error | null },
    { name: 'propagate errors from initializer', error: new Error('init failed') },
  ])('should $name', async ({ error }) => {
    if (error) {
      initializePackageSystem.mockRejectedValueOnce(error)
      await expect(initializePackages()).rejects.toThrow('init failed')
    } else {
      initializePackageSystem.mockResolvedValueOnce(undefined)
      await expect(initializePackages()).resolves.toBeUndefined()
    }

    expect(initializePackageSystem).toHaveBeenCalledTimes(1)
  })
})
