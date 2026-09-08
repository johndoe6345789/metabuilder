import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  fetchSubmissions,
  readFailure,
  setSubmissionStatus,
} from './submissions-data'

const envelope = (rows: unknown[]) => ({ data: { data: rows } })

afterEach(() => vi.unstubAllGlobals())

/**
 * The inbox was the first screen that would ever read this entity, and a
 * data layer that does not have it answers exactly like a data layer with
 * nothing in it. Saying which is the whole reason the screen exists.
 */
describe('readFailure', () => {
  it.each([404, 422])('names a missing entity for %i', status => {
    expect(readFailure(status)).toContain('does not have a FormSubmission')
  })

  it.each([401, 403])('says it was refused for %i', status => {
    expect(readFailure(status)).toContain('Not allowed')
  })

  it('falls back to the status for anything else', () => {
    expect(readFailure(500)).toBe('Could not read messages (HTTP 500).')
  })
})

describe('fetchSubmissions', () => {
  it("asks for this community's own messages", async () => {
    const seen: string[] = []
    vi.stubGlobal(
      'fetch',
      vi.fn(async (u: string) => {
        seen.push(u)
        return { ok: true, json: async () => envelope([]) }
      })
    )

    await fetchSubmissions('kestrelbindery')

    expect(seen[0]).toContain('/kestrelbindery/core/FormSubmission')
    expect(seen[0]).not.toContain('/system/')
  })

  it('reads the rows out of the real DBAL envelope', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () =>
          envelope([{ id: 'fs_1', formName: 'contact', data: { a: 'b' } }]),
      }))
    )

    const rows = await fetchSubmissions('acme')

    expect(rows).toHaveLength(1)
    expect(rows[0].data).toEqual({ a: 'b' })
  })

  it('puts the newest message first', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () =>
          envelope([
            { id: 'old', createdAt: 1751500000 },
            { id: 'new', createdAt: 1751600000 },
          ]),
      }))
    )

    expect((await fetchSubmissions('acme')).map(r => r.id)).toEqual([
      'new',
      'old',
    ])
  })

  // An unreadable inbox must not render as an empty one.
  it('throws with the reason rather than answering empty', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 404 })))

    await expect(fetchSubmissions('acme')).rejects.toThrow(
      /does not have a FormSubmission/
    )
  })
})

describe('setSubmissionStatus', () => {
  it('writes the status to that row, as the caller', async () => {
    const calls: [string, RequestInit][] = []
    vi.stubGlobal(
      'fetch',
      vi.fn(async (u: string, init: RequestInit) => {
        calls.push([u, init])
        return { ok: true }
      })
    )

    await setSubmissionStatus('acme', 'fs_1', 'handled')

    const [u, init] = calls[0]
    expect(u).toContain('/acme/core/FormSubmission/fs_1')
    expect(init.method).toBe('PUT')
    expect(init.credentials).toBe('include')
    expect(JSON.parse(String(init.body))).toEqual({ status: 'handled' })
  })

  it('throws with the status when the write is refused', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 403 })))
    await expect(setSubmissionStatus('a', 'b', 'handled')).rejects.toThrow(
      'HTTP 403'
    )
  })
})
