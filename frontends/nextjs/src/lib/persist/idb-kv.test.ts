import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  createFakeIndexedDb,
  type FakeIdbOptions,
} from '@/test/fake-indexeddb'
import type * as IdbKv from './idb-kv'

type Module = typeof IdbKv

/**
 * The open request is memoised in a module-level promise, so every test
 * needs a fresh registry to reach a differently-behaving database.
 */
const load = async (
  options?: FakeIdbOptions,
  seed?: Array<[IDBValidKey, unknown]>
): Promise<{ mod: Module; fake: ReturnType<typeof createFakeIndexedDb> }> => {
  vi.resetModules()
  const fake = createFakeIndexedDb(options ?? {}, seed)
  vi.stubGlobal('indexedDB', fake.indexedDB)
  return { mod: await import('./idb-kv'), fake }
}

/** jsdom ships no IndexedDB at all, which is the fallback's real case. */
const loadWithoutIdb = async (): Promise<Module> => {
  vi.resetModules()
  vi.stubGlobal('indexedDB', undefined)
  return await import('./idb-kv')
}

beforeEach(() => localStorage.clear())
afterEach(() => vi.unstubAllGlobals())

describe('idbGet / idbSet with IndexedDB', () => {
  it('reads back what it wrote', async () => {
    const { mod } = await load()
    await mod.idbSet('k', { a: 1 })
    expect(await mod.idbGet('k')).toEqual({ a: 1 })
  })

  it('is null for a key that was never written', async () => {
    const { mod } = await load()
    expect(await mod.idbGet('missing')).toBeNull()
  })

  it('stores the value in the database', async () => {
    const { mod, fake } = await load()
    await mod.idbSet('k', 'v')
    expect(fake.data.get('k')).toBe('v')
  })

  // Belt and braces: the same value is written to localStorage, so a
  // database that later refuses to open does not lose it.
  it('mirrors every write to localStorage', async () => {
    const { mod } = await load()
    await mod.idbSet('k', { a: 1 })
    expect(localStorage.getItem('k')).toBe('{"a":1}')
  })

  it('falls back to the mirror when the read fails', async () => {
    const { mod } = await load({ failReads: true })
    localStorage.setItem('k', '"mirrored"')
    expect(await mod.idbGet('k')).toBe('mirrored')
  })

  it('falls back to the mirror when the row is absent', async () => {
    const { mod } = await load()
    localStorage.setItem('k', '"mirrored"')
    expect(await mod.idbGet('k')).toBe('mirrored')
  })

  it('does not throw when a write transaction fails', async () => {
    const { mod } = await load({ failWrites: true })
    await expect(mod.idbSet('k', 'v')).resolves.toBeUndefined()
    expect(localStorage.getItem('k')).toBe('"v"')
  })

  it('opens the database once, however many calls are made', async () => {
    const { mod, fake } = await load()
    const open = vi.spyOn(fake.indexedDB, 'open')
    await mod.idbSet('a', 1)
    await mod.idbGet('a')
    await mod.idbGet('b')
    expect(open).toHaveBeenCalledTimes(1)
  })
})

describe('idbGet / idbSet without IndexedDB', () => {
  it('reads and writes through localStorage', async () => {
    const mod = await loadWithoutIdb()
    await mod.idbSet('k', [1, 2])
    expect(await mod.idbGet('k')).toEqual([1, 2])
  })

  it('is null for a key with nothing stored', async () => {
    const mod = await loadWithoutIdb()
    expect(await mod.idbGet('missing')).toBeNull()
  })

  it('is null rather than throwing on unparseable stored text', async () => {
    const mod = await loadWithoutIdb()
    localStorage.setItem('k', '{ not json')
    expect(await mod.idbGet('k')).toBeNull()
  })

  it('does not throw when localStorage refuses the write', async () => {
    const mod = await loadWithoutIdb()
    const setItem = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('QuotaExceededError')
      })
    await expect(mod.idbSet('k', 'v')).resolves.toBeUndefined()
    setItem.mockRestore()
  })

  it('is null rather than throwing when localStorage refuses the read', async () => {
    const mod = await loadWithoutIdb()
    const getItem = vi
      .spyOn(Storage.prototype, 'getItem')
      .mockImplementation(() => {
        throw new Error('SecurityError')
      })
    expect(await mod.idbGet('k')).toBeNull()
    getItem.mockRestore()
  })
})

describe('idbGet with a database that will not open', () => {
  it('falls back to localStorage', async () => {
    const { mod } = await load({ failOpen: true })
    localStorage.setItem('k', '"from the mirror"')
    expect(await mod.idbGet('k')).toBe('from the mirror')
  })

  it('still mirrors writes', async () => {
    const { mod } = await load({ failOpen: true })
    await mod.idbSet('k', 'v')
    expect(localStorage.getItem('k')).toBe('"v"')
  })
})

describe('idbDump', () => {
  it('returns every stored pair', async () => {
    const { mod } = await load({}, [
      ['a', 1],
      ['b', { two: true }],
    ])
    expect(await mod.idbDump()).toEqual({ a: 1, b: { two: true } })
  })

  it('is empty when the database will not open', async () => {
    const { mod } = await load({ failOpen: true })
    expect(await mod.idbDump()).toEqual({})
  })

  it('is empty rather than a rejection when the read fails', async () => {
    const { mod } = await load({ failReads: true }, [['a', 1]])
    expect(await mod.idbDump()).toEqual({})
  })

  it('renders a numeric key as a string', async () => {
    const { mod } = await load({}, [[7, 'seven']])
    expect(await mod.idbDump()).toEqual({ '7': 'seven' })
  })

  it('renders a date key as an ISO string', async () => {
    const when = new Date('2026-01-15T00:00:00.000Z')
    const { mod } = await load({}, [[when, 'then']])
    expect(await mod.idbDump()).toEqual({
      '2026-01-15T00:00:00.000Z': 'then',
    })
  })

  it('renders a composite key as JSON', async () => {
    const { mod } = await load({}, [[['a', 1], 'composite']])
    expect(await mod.idbDump()).toEqual({ '["a",1]': 'composite' })
  })
})

describe('idbRestore', () => {
  it('writes every pair back', async () => {
    const { mod, fake } = await load()
    await mod.idbRestore({ a: 1, b: 'two' })
    expect(fake.data.get('a')).toBe(1)
    expect(fake.data.get('b')).toBe('two')
  })

  it('round-trips a dump', async () => {
    const { mod } = await load({}, [
      ['a', 1],
      ['b', 2],
    ])
    const dumped = await mod.idbDump()
    const restored = await load()
    await restored.mod.idbRestore(dumped)
    expect(await restored.mod.idbDump()).toEqual(dumped)
  })

  it('accepts an empty project', async () => {
    const { mod } = await load()
    await expect(mod.idbRestore({})).resolves.toBeUndefined()
  })
})
