import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { db } from './db-client'
import { mockFetch } from './db-client/test-support'

beforeEach(() => vi.clearAllMocks())
afterEach(() => vi.unstubAllGlobals())

describe('read', () => {
  it('returns the unwrapped record', async () => {
    mockFetch({ success: true, data: { id: 'a' } })

    expect(await db.entity('Post').read('a')).toEqual({ id: 'a' })
  })

  it('returns null rather than throwing when it fails', async () => {
    mockFetch({}, false)

    expect(await db.entity('Post').read('a')).toBeNull()
  })

  it('addresses the record by id', async () => {
    const calls = mockFetch({ data: {} })

    await db.entity('Post').read('a1')

    expect(calls[0].url).toMatch(/\/Post\/a1$/)
  })
})
