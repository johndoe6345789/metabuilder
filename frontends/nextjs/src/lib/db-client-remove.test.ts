import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { db } from './db-client'
import { mockFetch } from './db-client/test-support'

beforeEach(() => vi.clearAllMocks())
afterEach(() => vi.unstubAllGlobals())

describe('remove', () => {
  it('reports success', async () => {
    const calls = mockFetch({})

    expect(await db.entity('Post').remove('a')).toBe(true)
    expect(calls[0].method).toBe('DELETE')
  })

  it('reports failure rather than throwing', async () => {
    mockFetch({}, false)

    expect(await db.entity('Post').remove('a')).toBe(false)
  })
})
