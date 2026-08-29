import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const client = vi.hoisted(() => ({
  db: { users: { list: vi.fn(), create: vi.fn() } },
}))
vi.mock('@/lib/db-client', () => client)
vi.mock('@/lib/tenant/workspace-paths', () => ({
  DEFAULT_TENANT_ID: 'system',
}))

import { register } from './register'

const created = {
  id: 'new-id',
  username: 'alice',
  email: 'alice@example.com',
  role: 'user',
  createdAt: 1700000000000,
  tenantId: 'system',
}

/** Captures what the Credential provisioning call sends to DBAL. */
const stubCredentialEndpoint = (ok = true) => {
  const calls: { url: string; auth?: string; body?: string }[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      calls.push({
        url: String(url),
        auth: (init?.headers as Record<string, string>)?.Authorization,
        body: init?.body as string,
      })
      return {
        ok,
        status: ok ? 200 : 403,
        text: async () => 'refused',
      } as Response
    })
  )
  return calls
}

beforeEach(() => {
  vi.clearAllMocks()
  client.db.users.list.mockResolvedValue({ data: [] })
  client.db.users.create.mockResolvedValue(created)
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => vi.unstubAllGlobals())

describe('register', () => {
  it('rejects an empty username', async () => {
    const result = await register('', 'a@b.c', 'pw')
    expect(result).toMatchObject({ success: false, user: null })
    expect(client.db.users.create).not.toHaveBeenCalled()
  })

  it('rejects an empty email', async () => {
    expect(await register('alice', '', 'pw')).toMatchObject({ success: false })
  })

  it('rejects an empty password', async () => {
    expect(await register('alice', 'a@b.c', '')).toMatchObject({
      success: false,
    })
  })

  it('rejects a username that is already taken', async () => {
    client.db.users.list.mockResolvedValueOnce({ data: [created] })
    const result = await register('alice', 'a@b.c', 'pw')
    expect(result.error).toBe('Username already exists')
    expect(client.db.users.create).not.toHaveBeenCalled()
  })

  it('rejects an email that is already taken', async () => {
    client.db.users.list
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [created] })
    const result = await register('alice', 'a@b.c', 'pw')
    expect(result.error).toBe('Email already exists')
    expect(client.db.users.create).not.toHaveBeenCalled()
  })

  it('returns the created user on success', async () => {
    stubCredentialEndpoint()
    const result = await register('alice', 'alice@example.com', 'pw')
    expect(result.success).toBe(true)
    expect(result.user).toMatchObject({
      id: 'new-id',
      username: 'alice',
      role: 'user',
      isInstanceOwner: false,
    })
  })

  // A row written with a null tenantId is invisible to every tenant-scoped
  // list query, including the one that resolves a login token to a user --
  // so an account created that way could never log in.
  it('stamps the default tenant on the new row', async () => {
    stubCredentialEndpoint()
    await register('alice', 'alice@example.com', 'pw')
    expect(client.db.users.create).toHaveBeenCalledWith(
      expect.objectContaining({ tenantId: 'system', role: 'user' })
    )
  })

  it('never lets the caller choose its own role', async () => {
    stubCredentialEndpoint()
    await register('alice', 'alice@example.com', 'pw')
    const row = client.db.users.create.mock.calls[0]?.[0] as {
      role: string
      isInstanceOwner: boolean
    }
    expect(row.role).toBe('user')
    expect(row.isInstanceOwner).toBe(false)
  })

  it('gives the new row a generated id', async () => {
    stubCredentialEndpoint()
    await register('alice', 'alice@example.com', 'pw')
    const row = client.db.users.create.mock.calls[0]?.[0] as { id: string }
    expect(row.id).toMatch(/^[0-9a-f-]{36}$/)
  })

  // The password is hashed by DBAL with Argon2id, which is what its OIDC
  // login verifies against -- hashing it here with anything else would
  // produce an account that cannot sign in.
  it('provisions the credential through DBAL rather than hashing here', async () => {
    const calls = stubCredentialEndpoint()
    await register('alice', 'alice@example.com', 'secret')
    expect(calls[0]?.url).toContain('/admin/credentials')
    expect(JSON.parse(calls[0]?.body ?? '{}')).toEqual({
      username: 'alice',
      password: 'secret',
    })
  })

  it('sends the admin token rather than the caller\'s own', async () => {
    process.env.DBAL_ADMIN_TOKEN = 'operator-token'
    const calls = stubCredentialEndpoint()
    await register('alice', 'alice@example.com', 'pw')
    expect(calls[0]?.auth).toBe('Bearer operator-token')
    delete process.env.DBAL_ADMIN_TOKEN
  })

  it('never writes the password into the user row', async () => {
    stubCredentialEndpoint()
    await register('alice', 'alice@example.com', 'secret')
    const row = JSON.stringify(client.db.users.create.mock.calls[0]?.[0])
    expect(row).not.toContain('secret')
  })

  it('reports failure when the credential cannot be provisioned', async () => {
    stubCredentialEndpoint(false)
    const result = await register('alice', 'alice@example.com', 'pw')
    expect(result.success).toBe(false)
    expect(result.error).toContain('Failed to provision credential')
  })

  it('reports failure rather than throwing when the write fails', async () => {
    client.db.users.create.mockRejectedValue(new Error('dbal down'))
    expect(await register('alice', 'a@b.c', 'pw')).toMatchObject({
      success: false,
      user: null,
      error: 'dbal down',
    })
  })
})
