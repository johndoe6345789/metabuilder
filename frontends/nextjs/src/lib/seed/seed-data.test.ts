import { beforeEach, describe, expect, it, vi } from 'vitest'

const { initializeAllSeedData } = vi.hoisted(() => ({
  initializeAllSeedData: vi.fn(),
}))

vi.mock('@/seed-data', () => ({
  initializeAllSeedData,
}))

import { seedDatabase } from '@/lib/seed-data'

describe('seedDatabase', () => {
  beforeEach(() => {
    initializeAllSeedData.mockReset()
  })

  it.each([
    { name: 'resolve when initializer succeeds', error: null as Error | null },
    { name: 'propagate errors from initializer', error: new Error('seed failed') },
  ])('should $name', async ({ error }) => {
    if (error) {
      initializeAllSeedData.mockRejectedValueOnce(error)
      await expect(seedDatabase()).rejects.toThrow('seed failed')
    } else {
      initializeAllSeedData.mockResolvedValueOnce(undefined)
      await expect(seedDatabase()).resolves.toBeUndefined()
    }

    expect(initializeAllSeedData).toHaveBeenCalledTimes(1)
  })
})
