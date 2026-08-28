import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { db, getDB } from './db-client'

function mockFetch(body: unknown, ok = true) {
  const calls: { url: string; method: string; body?: string }[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      calls.push({
        url: String(url),
        method: init?.method ?? 'GET',
        body: init?.body as string | undefined,
      })
      return {
        ok,
        status: ok ? 200 : 500,
        json: async () => body,
        text: async () => JSON.stringify(body),
      } as Response
    })
  )
  return calls
}

describe('db client', () => {
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
})
