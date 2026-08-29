import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { tenantExists } from './tenant-exists'

const DBAL = 'http://dbal:8080'
const rows = (n: number) => ({ data: { data: Array.from({ length: n }) } })

interface Reply {
  ok?: boolean
  status?: number
  body?: unknown
}

/** Answers /User and /PageConfig separately, and records what was asked. */
const stub = (users: Reply, pages: Reply = users): string[] => {
  const asked: string[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      const href = String(url)
      asked.push(href)
      const reply = href.includes('/User') ? users : pages
      const status = reply.status ?? (reply.ok === false ? 404 : 200)
      return {
        ok: reply.ok ?? status < 400,
        status,
        json: async () => reply.body ?? rows(0),
      } as Response
    })
  )
  return asked
}

beforeEach(() => vi.clearAllMocks())
afterEach(() => vi.unstubAllGlobals())

describe('tenantExists — names', () => {
  // DBAL answers 400 for a name it cannot route, so anything outside the
  // shape is definitively not a tenant and is not worth a request.
  it.each([
    ['acme-corp', 'a hyphen'],
    ['acme.corp', 'a dot'],
    ['acme corp', 'a space'],
    ['../etc', 'a traversal'],
    ['acme/x', 'a separator'],
    ['', 'an empty name'],
    ['tenant!', 'punctuation'],
  ])('refuses %p (%s) without asking', async (tenant, _why) => {
    const asked = stub({ ok: true, body: rows(1) })
    expect(await tenantExists(DBAL, tenant)).toBe(false)
    expect(asked).toHaveLength(0)
  })

  it.each(['acme', 'system', 'Tenant_1', 'a1'])('accepts %p', async tenant => {
    const asked = stub({ ok: true, body: rows(1) })
    expect(await tenantExists(DBAL, tenant)).toBe(true)
    expect(asked.length).toBeGreaterThan(0)
  })
})

describe('tenantExists — lookups', () => {
  // The tenant goes in the PATH, not a filter: DBAL scopes by the URL and
  // ignores filter.tenantId, so a filtered check called every made-up
  // tenant real by answering with the system god user.
  it('puts the tenant in the path, not in a filter', async () => {
    const asked = stub({ ok: true, body: rows(0) })
    await tenantExists(DBAL, 'acme')
    expect(asked[0]).toContain('/acme/core/User')
    expect(asked.join()).not.toContain('filter.tenantId')
  })

  it('checks users and published pages', async () => {
    const asked = stub({ ok: true, body: rows(0) })
    await tenantExists(DBAL, 'acme')
    expect(asked.some(u => u.includes('/User'))).toBe(true)
    expect(asked.some(u => u.includes('/PageConfig'))).toBe(true)
  })

  it('exists when it has a user', async () => {
    stub({ ok: true, body: rows(1) }, { ok: true, body: rows(0) })
    expect(await tenantExists(DBAL, 'acme')).toBe(true)
  })

  // A tenant can have content before it has accounts.
  it('exists when it has a page but no users', async () => {
    stub({ ok: true, body: rows(0) }, { ok: true, body: rows(1) })
    expect(await tenantExists(DBAL, 'acme')).toBe(true)
  })

  it('does not exist when both are empty', async () => {
    stub({ ok: true, body: rows(0) })
    expect(await tenantExists(DBAL, 'acme')).toBe(false)
  })

  it('does not exist when both are refused', async () => {
    stub({ ok: false, status: 404 })
    expect(await tenantExists(DBAL, 'acme')).toBe(false)
  })

  it('ignores a payload that is not a list', async () => {
    stub({ ok: true, body: { data: { data: 'nope' } } })
    expect(await tenantExists(DBAL, 'acme')).toBe(false)
  })
})

describe('tenantExists — when the answer cannot be had', () => {
  // Not finding out is different from finding out there is nothing: an
  // outage must not turn every page in the system into a 404.
  it.each([500, 502, 503])('assumes it exists on a %i', async status => {
    stub({ status })
    expect(await tenantExists(DBAL, 'acme')).toBe(true)
  })

  it('assumes it exists when only the page check fails', async () => {
    stub({ ok: true, body: rows(0) }, { status: 503 })
    expect(await tenantExists(DBAL, 'acme')).toBe(true)
  })

  it('assumes it exists when the data layer is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new Error('ECONNREFUSED')
    }))
    expect(await tenantExists(DBAL, 'acme')).toBe(true)
  })

  it('passes an abort signal through', async () => {
    const seen: (AbortSignal | undefined)[] = []
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, init?: RequestInit) => {
        seen.push(init?.signal ?? undefined)
        return { ok: true, status: 200, json: async () => rows(0) } as Response
      })
    )
    const controller = new AbortController()
    await tenantExists(DBAL, 'acme', controller.signal)
    expect(seen[0]).toBe(controller.signal)
  })
})
