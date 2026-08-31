import { beforeEach, describe, expect, it, vi } from 'vitest'

const list = vi.hoisted(() => vi.fn(async () => ({ data: [] as unknown[] })))

vi.mock('@/lib/db-client', () => ({
  db: { installedPackages: { list } },
}))

import { loadInstalledPackage } from './load-package'

describe('loadInstalledPackage', () => {
  beforeEach(() => {
    list.mockClear()
  })

  it('filters by packageId and enabled', async () => {
    await loadInstalledPackage('media')
    expect(list).toHaveBeenCalledWith({
      filter: { packageId: 'media', enabled: true },
    })
  })

  it('returns null when nothing matches', async () => {
    list.mockResolvedValueOnce({ data: [] })
    expect(await loadInstalledPackage('media')).toBeNull()
  })

  it('returns the first match', async () => {
    list.mockResolvedValueOnce({ data: [{ id: 'p1' }] })
    expect(await loadInstalledPackage('media')).toEqual({ id: 'p1' })
  })
})
