import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { db, getDB } from './db-client'
import { mockFetch } from './db-client/test-support'

beforeEach(() => vi.clearAllMocks())
afterEach(() => vi.unstubAllGlobals())

describe('entity naming', () => {
  it.each([
    ['users', 'User'],
    ['posts', 'Post'],
    ['workflows', 'Workflow'],
  ])('singularises and capitalises %s to %s', async (accessor, entity) => {
    const calls = mockFetch({ data: [] })

    await (db as unknown as Record<string, { list: () => Promise<unknown> }>)[
      accessor
    ].list()

    expect(calls[0].url).toContain(`/${entity}`)
  })

  it('does not strip the s from a double-s name', async () => {
    // "address" must not become "addres".
    const calls = mockFetch({ data: [] })

    await (
      db as unknown as Record<string, { list: () => Promise<unknown> }>
    ).address.list()

    expect(calls[0].url).toContain('/Address')
  })

  it('takes an explicit entity name verbatim', async () => {
    const calls = mockFetch({ data: [] })

    await db.entity('PageConfig').list()

    expect(calls[0].url).toContain('/PageConfig')
  })
})

describe('the singleton', () => {
  it('getDB returns the same proxy', () => {
    expect(getDB()).toBe(db)
  })

  it('answers undefined for a symbol property', () => {
    expect(
      (db as unknown as Record<symbol, unknown>)[Symbol.iterator]
    ).toBeUndefined()
  })
})
