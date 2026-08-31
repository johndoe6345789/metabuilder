import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { db } from './db-client'
import { mockFetch } from './db-client/test-support'

beforeEach(() => vi.clearAllMocks())
afterEach(() => vi.unstubAllGlobals())

describe('create and update', () => {
  it('posts the body', async () => {
    const calls = mockFetch({ success: true, data: { id: 'new' } })

    const created = await db.entity('Post').create({ title: 'T' })

    expect(calls[0].method).toBe('POST')
    expect(JSON.parse(calls[0].body ?? '{}')).toEqual({ title: 'T' })
    expect(created).toEqual({ id: 'new' })
  })

  it('puts to the record url', async () => {
    const calls = mockFetch({ success: true, data: { id: 'a' } })

    await db.entity('Post').update('a', { title: 'T' })

    expect(calls[0].method).toBe('PUT')
    expect(calls[0].url).toMatch(/\/Post\/a$/)
  })

  it('lets a failed create surface rather than swallowing it', async () => {
    // Unlike list/read, a failed write must not look like success.
    mockFetch({}, false)

    await expect(db.entity('Post').create({})).rejects.toThrow()
  })
})
