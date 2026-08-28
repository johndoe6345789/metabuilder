import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { idbDump, idbGet, idbRestore, idbSet } from '@/lib/persist/idb-kv'

/**
 * The god panel keeps work here, so the fallback matters more than the happy
 * path: with IndexedDB unavailable -- private browsing, SSR, an old browser
 * -- a save that silently does nothing loses the user's work.
 */
beforeEach(() => {
  // Force the localStorage tier by removing IndexedDB entirely.
  vi.stubGlobal('indexedDB', undefined)
  window.localStorage.clear()
})

afterEach(() => {
  vi.unstubAllGlobals()
  window.localStorage.clear()
})

describe('without IndexedDB', () => {
  it('still stores and returns a value', async () => {
    await idbSet('tree', { id: 'root' })
    await expect(idbGet('tree')).resolves.toEqual({ id: 'root' })
  })

  it('returns null for a key never written', async () => {
    await expect(idbGet('absent')).resolves.toBeNull()
  })

  it('round-trips values that are not objects', async () => {
    await idbSet('count', 7)
    await idbSet('on', true)
    await idbSet('name', 'dave')

    await expect(idbGet('count')).resolves.toBe(7)
    await expect(idbGet('on')).resolves.toBe(true)
    await expect(idbGet('name')).resolves.toBe('dave')
  })

  it('overwrites rather than appending', async () => {
    await idbSet('k', 'first')
    await idbSet('k', 'second')
    await expect(idbGet('k')).resolves.toBe('second')
  })

  it('reports an empty dump rather than throwing', async () => {
    // Export has nothing to read from the fallback tier; an empty object is
    // a usable answer where an exception would break the export button.
    await expect(idbDump()).resolves.toEqual({})
  })

  it('restores every entry it is given', async () => {
    await idbRestore({ a: 1, b: 'two' })

    await expect(idbGet('a')).resolves.toBe(1)
    await expect(idbGet('b')).resolves.toBe('two')
  })
})
