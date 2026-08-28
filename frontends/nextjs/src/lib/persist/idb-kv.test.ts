import { beforeEach, describe, expect, it, vi } from 'vitest'

import { idbDump, idbGet, idbRestore, idbSet } from './idb-kv'

/**
 * There is no IndexedDB in this environment, which is exactly the case the
 * module's fallback exists for: SSR, private mode, and old browsers. These
 * cover that path -- the one that decides whether a god-panel draft
 * survives or is silently lost when IndexedDB is unavailable.
 */
describe('idb-kv without IndexedDB', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  describe('idbSet and idbGet', () => {
    it('round-trips a value through localStorage', async () => {
      await idbSet('k', { a: 1 })

      await expect(idbGet('k')).resolves.toEqual({ a: 1 })
    })

    it('answers null for a key that was never set', async () => {
      await expect(idbGet('missing')).resolves.toBeNull()
    })

    it('round-trips falsy values that are not null', async () => {
      await idbSet('zero', 0)
      await idbSet('empty', '')
      await idbSet('no', false)

      await expect(idbGet('zero')).resolves.toBe(0)
      await expect(idbGet('empty')).resolves.toBe('')
      await expect(idbGet('no')).resolves.toBe(false)
    })

    it('round-trips an array', async () => {
      await idbSet('list', [1, 2, 3])

      await expect(idbGet('list')).resolves.toEqual([1, 2, 3])
    })

    it('overwrites a previous value', async () => {
      await idbSet('k', 'first')
      await idbSet('k', 'second')

      await expect(idbGet('k')).resolves.toBe('second')
    })

    it('answers null rather than throwing on corrupt stored JSON', async () => {
      // A half-written entry must not break the whole panel on load.
      localStorage.setItem('bad', '{not json')

      await expect(idbGet('bad')).resolves.toBeNull()
    })

    it('does not throw when storage is full', async () => {
      // Private-mode Safari throws on every setItem; losing the write is
      // acceptable, taking the caller down with it is not.
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new DOMException('QuotaExceededError')
      })

      await expect(idbSet('k', 'v')).resolves.toBeUndefined()
    })

    it('does not throw when storage cannot be read', async () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new DOMException('SecurityError')
      })

      await expect(idbGet('k')).resolves.toBeNull()
    })
  })

  describe('idbDump', () => {
    it('answers an empty object when there is no database', async () => {
      await idbSet('k', 'v')

      // The dump reads IndexedDB only; the fallback mirror is not enumerated.
      await expect(idbDump()).resolves.toEqual({})
    })
  })

  describe('idbRestore', () => {
    it('writes every entry back', async () => {
      await idbRestore({ a: 1, b: 'two' })

      await expect(idbGet('a')).resolves.toBe(1)
      await expect(idbGet('b')).resolves.toBe('two')
    })

    it('accepts an empty payload', async () => {
      await expect(idbRestore({})).resolves.toBeUndefined()
    })

    it('overwrites what was there before', async () => {
      await idbSet('a', 'old')

      await idbRestore({ a: 'new' })

      await expect(idbGet('a')).resolves.toBe('new')
    })
  })
})
