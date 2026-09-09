import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/app-config', () => ({ BASE_PATH: '/app' }))

import { submitEntity } from './submit-entity'

const target = { tenant: 'acme', pkg: 'core', entity: 'User' }

afterEach(() => vi.unstubAllGlobals())

const mockFetch = (impl: (url: string, init: RequestInit) => unknown) => {
  const fn = vi.fn(async (url: string, init: RequestInit) => impl(url, init))
  vi.stubGlobal('fetch', fn)
  return fn
}

describe('creating a row', () => {
  it('posts it to the entity, under the app base path', async () => {
    const fn = mockFetch(() => ({ ok: true }))

    expect(await submitEntity(target, { name: 'Rosa' })).toBeNull()

    const [url, init] = fn.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/app/api/v1/acme/core/User')
    expect(init.method).toBe('POST')
    // The cookie is how this app identifies a caller.
    expect(init.credentials).toBe('include')
    expect(JSON.parse(String(init.body))).toEqual({ name: 'Rosa' })
  })
})

describe('changing a row', () => {
  it('puts it to that row', async () => {
    const fn = mockFetch(() => ({ ok: true }))

    await submitEntity({ ...target, id: 'u1' }, { name: 'Rosa' })

    const [url, init] = fn.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/app/api/v1/acme/core/User/u1')
    expect(init.method).toBe('PUT')
  })
})

/**
 * The buttons on these forms were `type="button"` with no handler, so a
 * refusal and a success looked identical: nothing happened either way.
 */
describe('when it is refused', () => {
  it("repeats the server's own reason", async () => {
    mockFetch(() => ({
      ok: false,
      status: 422,
      json: async () => ({ error: 'username: Field is required' }),
    }))

    expect(await submitEntity(target, {})).toBe('username: Field is required')
  })

  it('falls back to the status when it gives no reason', async () => {
    mockFetch(() => ({ ok: false, status: 403, json: async () => null }))

    expect(await submitEntity(target, {})).toContain('HTTP 403')
  })

  it('says nothing was saved when the server cannot be reached', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new TypeError('Failed to fetch')))
    )

    expect(await submitEntity(target, {})).toContain('Nothing was saved')
  })
})
