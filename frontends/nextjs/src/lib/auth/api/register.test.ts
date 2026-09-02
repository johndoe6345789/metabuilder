import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const usersOps = () => ({
  list: vi.fn().mockResolvedValue({ data: [] }),
  create: vi.fn().mockResolvedValue(created),
})

const client = vi.hoisted(() => ({
  db: { entity: vi.fn() },
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
  role: 'god',
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

let ops: ReturnType<typeof usersOps>

beforeEach(() => {
  vi.clearAllMocks()
  ops = usersOps()
  client.db.entity.mockReturnValue(ops)
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => vi.unstubAllGlobals())

describe('register', () => {
  it('rejects an empty username', async () => {
    const result = await register('', 'a@b.c', 'pw')
    expect(result).toMatchObject({ success: false, user: null })
    expect(ops.create).not.toHaveBeenCalled()
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
    ops.list.mockResolvedValueOnce({ data: [created] })
    const result = await register('alice', 'a@b.c', 'pw')
    expect(result.error).toBe('Username already exists')
    expect(ops.create).not.toHaveBeenCalled()
  })

  it('rejects an email that is already taken', async () => {
    ops.list
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [created] })
    const result = await register('alice', 'a@b.c', 'pw')
    expect(result.error).toBe('Email already exists')
    expect(ops.create).not.toHaveBeenCalled()
  })

  it('returns the created user on success', async () => {
    stubCredentialEndpoint()
    const result = await register('alice', 'alice@example.com', 'pw')
    expect(result.success).toBe(true)
    expect(result.user).toMatchObject({
      id: 'new-id',
      username: 'alice',
      role: 'god',
      isInstanceOwner: false,
    })
  })

  it('defaults to the system tenant with no community name given', async () => {
    stubCredentialEndpoint()
    await register('alice', 'alice@example.com', 'pw')
    expect(client.db.entity).toHaveBeenCalledWith('User', 'system')
    expect(ops.create).toHaveBeenCalledWith(
      expect.objectContaining({ tenantId: 'system' })
    )
  })

  // Self-service signup founds a community, so it grants God Panel access
  // (level 4) -- but never 'supergod' (level 5), which is reserved for the
  // instance owner and must never be reachable through public signup.
  it('gives a new signup god-level access but never supergod', async () => {
    stubCredentialEndpoint()
    await register('alice', 'alice@example.com', 'pw')
    const row = ops.create.mock.calls[0]?.[0] as {
      role: string
      isInstanceOwner: boolean
    }
    expect(row.role).toBe('god')
    expect(row.isInstanceOwner).toBe(false)
  })

  it('gives a new row a generated id', async () => {
    stubCredentialEndpoint()
    await register('alice', 'alice@example.com', 'pw')
    const row = ops.create.mock.calls[0]?.[0] as { id: string }
    expect(row.id).toMatch(/^[0-9a-f-]{36}$/)
  })

  // The password is hashed by DBAL with Argon2id, which is what its OIDC
  // login verifies against -- hashing it here with anything else would
  // produce an account that cannot sign in.
  it('provisions the credential through DBAL rather than hashing here', async () => {
    const calls = stubCredentialEndpoint()
    await register('alice', 'alice@example.com', 'secret')
    expect(calls[0]?.url).toContain('/admin/credentials')
    expect(JSON.parse(calls[0]?.body ?? '{}')).toMatchObject({
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
    const row = JSON.stringify(ops.create.mock.calls[0]?.[0])
    expect(row).not.toContain('secret')
  })

  it('reports failure when the credential cannot be provisioned', async () => {
    stubCredentialEndpoint(false)
    const result = await register('alice', 'alice@example.com', 'pw')
    expect(result.success).toBe(false)
    expect(result.error).toContain('Failed to provision credential')
  })

  it('reports failure rather than throwing when the write fails', async () => {
    ops.create.mockRejectedValue(new Error('dbal down'))
    expect(await register('alice', 'a@b.c', 'pw')).toMatchObject({
      success: false,
      user: null,
      error: 'dbal down',
    })
  })

  describe('founding a named community', () => {
    it('creates the user under the given tenant, not system', async () => {
      stubCredentialEndpoint()
      await register('alice', 'alice@example.com', 'pw', 'acme')
      expect(client.db.entity).toHaveBeenCalledWith('User', 'acme')
      expect(ops.create).toHaveBeenCalledWith(
        expect.objectContaining({ tenantId: 'acme' })
      )
    })

    it('sends the new tenant to DBAL when provisioning the credential', async () => {
      const calls = stubCredentialEndpoint()
      await register('alice', 'alice@example.com', 'pw', 'acme')
      expect(JSON.parse(calls[0]?.body ?? '{}')).toMatchObject({
        tenantId: 'acme',
      })
    })

    it('rejects founding a community whose name is already taken', async () => {
      ops.list.mockResolvedValueOnce({ data: [created] })
      const result = await register('bob', 'bob@example.com', 'pw', 'acme')
      expect(result.success).toBe(false)
      expect(result.error).toBe('That community name is already taken')
      expect(ops.create).not.toHaveBeenCalled()
    })

    it('does not check for a name collision against the system tenant', async () => {
      // No tenantName -> no "is this community already founded" check at
      // all, since 'system' is the shared bucket every un-named signup
      // lands in and isn't "owned" by any single founder.
      stubCredentialEndpoint()
      await register('alice', 'alice@example.com', 'pw')
      expect(ops.list).toHaveBeenCalledTimes(2) // username + email only
    })

    it('treats a blank community name the same as none', async () => {
      stubCredentialEndpoint()
      await register('alice', 'alice@example.com', 'pw', '')
      expect(client.db.entity).toHaveBeenCalledWith('User', 'system')
    })
  })
})
