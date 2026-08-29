import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/app-config', () => ({ BASE_PATH: '/app' }))

import { fetchAccounts, setCredential } from './credentials-api'

interface Call {
  url: string
  method?: string
  body?: string
  credentials?: string
}

const envelope = (rows: unknown[]) => ({ data: { data: rows } })

/** Answers each URL from a table, and records what was asked. */
const stub = (
  table: Record<string, { ok: boolean; status?: number; body?: unknown }>
): Call[] => {
  const calls: Call[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      const href = String(url)
      calls.push({
        url: href,
        method: init?.method,
        body: init?.body as string | undefined,
        credentials: init?.credentials,
      })
      const key = Object.keys(table).find(k => href.includes(k)) ?? ''
      const entry = table[key] ?? { ok: false, status: 404 }
      return {
        ok: entry.ok,
        status: entry.status ?? (entry.ok ? 200 : 500),
        json: async () => entry.body ?? {},
      } as Response
    })
  )
  return calls
}

beforeEach(() => vi.clearAllMocks())
afterEach(() => vi.unstubAllGlobals())

describe('fetchAccounts', () => {
  it('filters by tenant for a scoped view', async () => {
    const calls = stub({ User: { ok: true, body: envelope([]) } })
    await fetchAccounts('acme', false)
    expect(calls[0]?.url).toContain('filter.tenantId=acme')
  })

  it('sends no filter for the all scope', async () => {
    const calls = stub({ User: { ok: true, body: envelope([]) } })
    await fetchAccounts('all', true)
    expect(calls[0]?.url).not.toContain('filter.tenantId')
  })

  // The tenant list is only needed to populate a supergod's switcher.
  it('does not ask for tenants unless the viewer is a supergod', async () => {
    const calls = stub({ User: { ok: true, body: envelope([]) } })
    await fetchAccounts('acme', false)
    expect(calls.some(c => c.url.includes('Tenant'))).toBe(false)
  })

  it('asks for tenants for a supergod', async () => {
    const calls = stub({
      User: { ok: true, body: envelope([]) },
      Tenant: { ok: true, body: envelope([{ id: 't1' }]) },
    })
    const result = await fetchAccounts('all', true)
    expect(calls.some(c => c.url.includes('Tenant'))).toBe(true)
    expect(result.tenants).toEqual([{ id: 't1' }])
  })

  it('reads accounts out of the real DBAL envelope', async () => {
    stub({
      User: { ok: true, body: envelope([{ username: 'alice' }]) },
    })
    const result = await fetchAccounts('acme', false)
    expect(result.accounts).toEqual([{ username: 'alice' }])
  })

  // A row a password cannot be set for is not an account to show.
  it.each([{}, { username: '' }, { username: null }])(
    'drops the usernameless row %j',
    row => {
      return expect(
        stubbedAccounts(row).then(r => r.accounts)
      ).resolves.toEqual([])
    }
  )

  const stubbedAccounts = async (row: unknown) => {
    stub({ User: { ok: true, body: envelope([row]) } })
    return await fetchAccounts('acme', false)
  }

  it('throws with the status when the user list is refused', async () => {
    stub({ User: { ok: false, status: 403 } })
    await expect(fetchAccounts('acme', false)).rejects.toThrow(
      'User list failed with 403'
    )
  })

  // Losing the tenant list costs a supergod their switcher, not the page.
  it('still returns accounts when the tenant list fails', async () => {
    stub({
      User: { ok: true, body: envelope([{ username: 'alice' }]) },
      Tenant: { ok: false, status: 500 },
    })
    const result = await fetchAccounts('all', true)
    expect(result.accounts).toHaveLength(1)
    expect(result.tenants).toEqual([])
  })
})

describe('setCredential', () => {
  it('posts to our own origin, not to the data layer', async () => {
    const calls = stub({ credentials: { ok: true, body: {} } })
    await setCredential('alice', 'longenough', 'acme')
    expect(calls[0]?.url).toBe('/app/api/admin/credentials')
    expect(calls[0]?.method).toBe('POST')
    expect(calls[0]?.credentials).toBe('include')
  })

  // The route attaches the admin token and lets DBAL hash with Argon2id.
  // Hashing here would produce a digest verify_password cannot check.
  it('sends the plaintext for the route to forward', async () => {
    const calls = stub({ credentials: { ok: true, body: {} } })
    await setCredential('alice', 'longenough', 'acme')
    expect(JSON.parse(calls[0]?.body ?? '{}')).toEqual({
      username: 'alice',
      password: 'longenough',
      tenantId: 'acme',
    })
  })

  it('raises the route\'s own reason when it refuses', async () => {
    stub({
      credentials: { ok: false, status: 403, body: { error: 'not your tenant' } },
    })
    await expect(setCredential('a', 'b', 'c')).rejects.toThrow(
      'not your tenant'
    )
  })

  it('raises a generic reason when the refusal carries none', async () => {
    stub({ credentials: { ok: false, status: 500 } })
    await expect(setCredential('a', 'b', 'c')).rejects.toThrow(
      'Credential write refused'
    )
  })
})
