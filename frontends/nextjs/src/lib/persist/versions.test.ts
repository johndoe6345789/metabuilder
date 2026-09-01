import { beforeEach, describe, expect, it, vi } from 'vitest'

const idb = vi.hoisted(() => ({ idbGet: vi.fn(), idbSet: vi.fn() }))
vi.mock('./idb-kv', () => idb)

import { getVersion, listVersions, snapshot } from './versions'

beforeEach(() => {
  vi.clearAllMocks()
  idb.idbGet.mockResolvedValue(undefined)
  idb.idbSet.mockResolvedValue(undefined)
})

describe('snapshot', () => {
  it('stores a new snapshot ahead of any existing ones', async () => {
    idb.idbGet.mockResolvedValue([{ id: 'v_old', label: 'Old', at: 1, data: {} }])

    const snap = await snapshot('page1', { a: 1 }, 'Published')

    expect(snap.label).toBe('Published')
    expect(snap.data).toEqual({ a: 1 })
    expect(idb.idbSet).toHaveBeenCalledWith(
      'page1.versions',
      expect.arrayContaining([
        expect.objectContaining({ label: 'Published' }),
        expect.objectContaining({ id: 'v_old' }),
      ])
    )
  })

  it('defaults the label to "Publish"', async () => {
    const snap = await snapshot('page1', {})
    expect(snap.label).toBe('Publish')
  })

  it('deep-clones the data so later mutation does not affect the snapshot', async () => {
    const data = { nested: { a: 1 } }
    const snap = await snapshot('page1', data)
    data.nested.a = 2
    expect(snap.data).toEqual({ nested: { a: 1 } })
  })

  it('caps the stored list at 50 versions', async () => {
    const existing = Array.from({ length: 50 }, (_, i) => ({
      id: `v${i}`,
      label: 'x',
      at: i,
      data: {},
    }))
    idb.idbGet.mockResolvedValue(existing)

    await snapshot('page1', {})

    const stored = idb.idbSet.mock.calls[0][1] as unknown[]
    expect(stored).toHaveLength(50)
  })
})

describe('listVersions', () => {
  it('returns the stored list', async () => {
    idb.idbGet.mockResolvedValue([{ id: 'v1', label: 'x', at: 1, data: {} }])
    expect(await listVersions('page1')).toHaveLength(1)
  })

  it('defaults to an empty list when nothing is stored', async () => {
    idb.idbGet.mockResolvedValue(undefined)
    expect(await listVersions('page1')).toEqual([])
  })
})

describe('getVersion', () => {
  it('returns the data for a matching id', async () => {
    idb.idbGet.mockResolvedValue([
      { id: 'v1', label: 'x', at: 1, data: { hello: 'world' } },
    ])
    expect(await getVersion('page1', 'v1')).toEqual({ hello: 'world' })
  })

  it('returns null when no version matches', async () => {
    idb.idbGet.mockResolvedValue([])
    expect(await getVersion('page1', 'missing')).toBeNull()
  })
})
