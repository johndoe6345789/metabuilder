import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { db } from './db-client'
import { mockFetch } from './db-client/test-support'

beforeEach(() => vi.clearAllMocks())
afterEach(() => vi.unstubAllGlobals())

describe('list', () => {
  it('unwraps the success envelope', async () => {
    mockFetch({ success: true, data: { data: [{ id: 'a' }], total: 1 } })

    const result = await db.entity('Post').list()

    expect(result.data).toEqual([{ id: 'a' }])
    expect(result.total).toBe(1)
  })

  it('accepts a bare array', async () => {
    mockFetch([{ id: 'a' }])

    const result = await db.entity('Post').list()

    expect(result.data).toEqual([{ id: 'a' }])
    expect(result.total).toBe(1)
  })

  it('answers an empty list for a shape it does not recognise', async () => {
    mockFetch({ unexpected: true })

    expect((await db.entity('Post').list()).data).toEqual([])
  })

  it('answers an empty list rather than throwing on failure', async () => {
    mockFetch({}, false)

    expect((await db.entity('Post').list()).data).toEqual([])
  })

  it('passes filters as filter.<key>', async () => {
    const calls = mockFetch({ data: [] })

    await db.entity('Post').list({ filter: { tenantId: 'acme' } })

    expect(calls[0].url).toContain('filter.tenantId=acme')
  })

  it('drops a null or undefined filter value', async () => {
    // Sending filter.x= would filter on the empty string, not skip it.
    const calls = mockFetch({ data: [] })

    await db
      .entity('Post')
      .list({ filter: { a: null as never, b: undefined as never, c: 'x' } })

    expect(calls[0].url).not.toContain('filter.a')
    expect(calls[0].url).not.toContain('filter.b')
    expect(calls[0].url).toContain('filter.c=x')
  })

  it('passes limit and offset', async () => {
    const calls = mockFetch({ data: [] })

    await db.entity('Post').list({ limit: 10, offset: 20 })

    expect(calls[0].url).toContain('_limit=10')
    expect(calls[0].url).toContain('_offset=20')
  })

  it('sends no query string when there is nothing to send', async () => {
    const calls = mockFetch({ data: [] })

    await db.entity('Post').list()

    expect(calls[0].url).not.toContain('?')
  })
})
