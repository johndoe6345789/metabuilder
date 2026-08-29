import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { isDbalOnline, readDbalStatus, readDbalVersion } from './dbal-status'

const stub = (
  table: Record<string, { ok: boolean; body?: unknown }>
): string[] => {
  const asked: string[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      const href = String(url)
      asked.push(href)
      const key = Object.keys(table).find(k => href.includes(k)) ?? ''
      const entry = table[key] ?? { ok: false }
      return { ok: entry.ok, json: async () => entry.body ?? {} } as Response
    })
  )
  return asked
}

beforeEach(() => vi.clearAllMocks())
afterEach(() => vi.unstubAllGlobals())

describe('isDbalOnline', () => {
  it('is true when health answers', async () => {
    stub({ '/health': { ok: true, body: { status: 'healthy' } } })
    expect(await isDbalOnline()).toBe(true)
  })

  it('is false when health refuses', async () => {
    stub({ '/health': { ok: false } })
    expect(await isDbalOnline()).toBe(false)
  })

  it('is false rather than throwing when it cannot connect', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new Error('ECONNREFUSED')
    }))
    expect(await isDbalOnline()).toBe(false)
  })
})

describe('readDbalVersion', () => {
  // The daemon exposes its version at /version, not at /health.
  it('reads it from /version', async () => {
    const asked = stub({ '/version': { ok: true, body: { version: '2.1' } } })
    expect(await readDbalVersion()).toBe('2.1')
    expect(asked[0]).toContain('/version')
  })

  it('is undefined when the body carries no version', async () => {
    stub({ '/version': { ok: true, body: {} } })
    expect(await readDbalVersion()).toBeUndefined()
  })

  it('is undefined when the version is not a string', async () => {
    stub({ '/version': { ok: true, body: { version: 2 } } })
    expect(await readDbalVersion()).toBeUndefined()
  })

  it('is undefined when the endpoint refuses', async () => {
    stub({ '/version': { ok: false } })
    expect(await readDbalVersion()).toBeUndefined()
  })
})

describe('readDbalStatus', () => {
  it('reports online with a version when both answer', async () => {
    stub({
      '/health': { ok: true, body: {} },
      '/version': { ok: true, body: { version: '2.1' } },
    })
    expect(await readDbalStatus()).toEqual({ state: 'online', version: '2.1' })
  })

  // A daemon that is up but will not name itself is still up.
  it('reports online with no version when only health answers', async () => {
    stub({ '/health': { ok: true, body: {} }, '/version': { ok: false } })
    expect(await readDbalStatus()).toEqual({
      state: 'online',
      version: undefined,
    })
  })

  it('reports offline when health does not answer', async () => {
    stub({ '/health': { ok: false }, '/version': { ok: false } })
    expect(await readDbalStatus()).toMatchObject({ state: 'offline' })
  })

  it('never reports checking -- that is only the starting state', async () => {
    stub({ '/health': { ok: false } })
    expect((await readDbalStatus()).state).not.toBe('checking')
  })
})
