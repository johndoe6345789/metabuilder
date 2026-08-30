import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchDbalHealth, fetchNavigablePackages, LEVEL_PACKAGES } from './app-shell-data'

const stub = (ok: boolean, body?: unknown): void => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok, json: async () => body ?? {} }) as Response)
  )
}

beforeEach(() => vi.clearAllMocks())
afterEach(() => vi.unstubAllGlobals())

describe('LEVEL_PACKAGES', () => {
  it('gives every level 0 through 5 a package set', () => {
    for (const level of [0, 1, 2, 3, 4, 5]) {
      expect(LEVEL_PACKAGES[level]).toBeDefined()
    }
  })

  it('includes global for everyone', () => {
    for (const packages of Object.values(LEVEL_PACKAGES)) {
      expect(packages).toContain('global')
    }
  })
})

describe('fetchDbalHealth', () => {
  it('is offline (true) when health answers not-ok', async () => {
    stub(false)
    expect(await fetchDbalHealth()).toBe(true)
  })

  it('is online (false) when health answers ok', async () => {
    stub(true)
    expect(await fetchDbalHealth()).toBe(false)
  })

  it('is offline rather than throwing when unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new Error('ECONNREFUSED')
    }))
    expect(await fetchDbalHealth()).toBe(true)
  })
})

const envelope = (rows: unknown[]) => ({ data: { data: rows } })

const record = (over: Record<string, unknown> = {}) => ({
  packageId: 'blog',
  name: 'Blog',
  showInNav: true,
  ...over,
})

describe('fetchNavigablePackages', () => {
  it('reads packages out of the real DBAL envelope', async () => {
    stub(true, envelope([record()]))
    const result = await fetchNavigablePackages()
    expect(result).toHaveLength(1)
    expect(result[0]?.packageId).toBe('blog')
  })

  it('is an empty array when the proxy refuses', async () => {
    stub(false)
    expect(await fetchNavigablePackages()).toEqual([])
  })

  it('is an empty array when the table is empty', async () => {
    stub(true, envelope([]))
    expect(await fetchNavigablePackages()).toEqual([])
  })

  it('is an empty array rather than throwing when unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new Error('offline')
    }))
    expect(await fetchNavigablePackages()).toEqual([])
  })

  it('drops a row missing a package id or a name', async () => {
    stub(true, envelope([{ name: 'No id' }, { packageId: 'no-name' }]))
    expect(await fetchNavigablePackages()).toEqual([])
  })

  it('keeps a row only navLabel/icon/level/category default to', async () => {
    stub(true, envelope([record({ navLabel: undefined })]))
    const [item] = await fetchNavigablePackages()
    expect(item?.navLabel).toBe('Blog')
  })

  // showInNav defaults to false in packageMetadataToNavItem, so a
  // package that never set it must not appear in navigation.
  it('excludes a package that does not opt into navigation', async () => {
    stub(true, envelope([record({ showInNav: false }), record({ packageId: 'x', showInNav: undefined })]))
    expect(await fetchNavigablePackages()).toEqual([])
  })
})
