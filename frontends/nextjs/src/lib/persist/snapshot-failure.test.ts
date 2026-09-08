import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { snapshot } from './versions'
import { idbSet } from './idb-kv'

/**
 * jsdom has no IndexedDB, so openDb() yields null and idbSet falls
 * through to localStorage alone -- which is exactly the tier a private
 * window or an exhausted quota refuses. Driving that refusal is enough to
 * exercise the path that used to be invisible.
 */
const refuseStorage = () => {
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new DOMException('QuotaExceededError')
  })
}

beforeEach(() => {
  localStorage.clear()
})
afterEach(() => {
  vi.restoreAllMocks()
})

/**
 * tx.onerror resolved exactly as tx.oncomplete did, and lsSet swallowed
 * its own failures, so a write nowhere accepted was indistinguishable from
 * one that landed. snapshot() then returned a Snapshot for a version that
 * did not exist, and the only reader -- the History panel -- showed its
 * "publish to snapshot" empty state to a founder who had just published.
 */
describe('a version no storage tier will take', () => {
  it('is reported by idbSet rather than swallowed', async () => {
    refuseStorage()
    expect(await idbSet('k', { a: 1 })).toBe(false)
  })

  it('is not handed back as though it were saved', async () => {
    refuseStorage()
    expect(await snapshot('god.workflow.acme', { id: 'w1' })).toBeNull()
  })

  it('is a snapshot when storage does accept it', async () => {
    expect(await idbSet('k', { a: 1 })).toBe(true)
    const snap = await snapshot('god.workflow.acme', { id: 'w1' })
    expect(snap?.data).toEqual({ id: 'w1' })
  })
})
