import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const usersOps = () => ({
  list: vi.fn().mockResolvedValue({ data: [] }),
  create: vi.fn(),
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

interface Call {
  url: string
  method?: string
  auth?: string
  body?: string
}

/**
 * Both privileged DBAL writes register() makes -- creating the User row and
 * provisioning the Credential -- now go through this same admin-authenticated
 * fetch, distinguished only by URL (.../User vs .../admin/credentials), so
 * one stub answers both rather than two separate ones.
 */
const stubDbal = (
  { userOk = true, credentialOk = true } = {}
): Call[] => {
  const calls: Call[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      calls.push({
        url: String(url),
        method: init?.method,
        auth: (init?.headers as Record<string, string>)?.Authorization,
        body: init?.body as string | undefined,
      })
      const isCredential = String(url).includes('/admin/credentials')
      const ok = isCredential ? credentialOk : userOk
      return {
        ok,
        status: ok ? 200 : 403,
        json: async () => ({ data: created, success: true }),
        text: async () => 'refused',
      } as Response
    })
  )
  return calls
}

const userCall = (calls: Call[]) =>
  calls.find(c => !c.url.includes('/admin/credentials'))
const credentialCall = (calls: Call[]) =>
  calls.find(c => c.url.includes('/admin/credentials'))

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
    expect(ops.list).not.toHaveBeenCalled()
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
  })

  it('rejects an email that is already taken', async () => {
    ops.list
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [created] })
    const result = await register('alice', 'a@b.c', 'pw')
    expect(result.error).toBe('Email already exists')
  })

  it('returns the created user on success', async () => {
    const calls = stubDbal()
    const result = await register('alice', 'alice@example.com', 'pw')
    expect(result.success).toBe(true)
    const written = JSON.parse(userCall(calls)?.body ?? '{}') as {
      id?: string
    }
    expect(result.user).toMatchObject({
      id: written.id,
      username: 'alice',
      role: 'god',
      isInstanceOwner: false,
    })
  })

  it('defaults to the system tenant with no community name given', async () => {
    const calls = stubDbal()
    await register('alice', 'alice@example.com', 'pw')
    expect(client.db.entity).toHaveBeenCalledWith('User', 'system')
    expect(userCall(calls)?.url).toContain('/system/core/User')
    expect(JSON.parse(userCall(calls)?.body ?? '{}')).toMatchObject({
      tenantId: 'system',
    })
  })

  // Self-service signup founds a community, so it grants God Panel access
  // (level 4) -- but never 'supergod' (level 5), which is reserved for the
  // instance owner and must never be reachable through public signup.
  it('gives a new signup god-level access but never supergod', async () => {
    const calls = stubDbal()
    await register('alice', 'alice@example.com', 'pw')
    const row = JSON.parse(userCall(calls)?.body ?? '{}') as { role: string }
    expect(row.role).toBe('god')
  })

  // isInstanceOwner is privileged: DBAL rejects any anonymous write that
  // sets it at all, even to false, since granting it is what makes a user
  // the instance owner (see the sibling dbal repo's write-authorization
  // check). The schema already defaults it to false, so the client must
  // never send the key -- not send it as false.
  it('never sends isInstanceOwner, since DBAL rejects that key on an anonymous write', async () => {
    const calls = stubDbal()
    await register('alice', 'alice@example.com', 'pw')
    const row = JSON.parse(userCall(calls)?.body ?? '{}') as Record<
      string,
      unknown
    >
    expect('isInstanceOwner' in row).toBe(false)
  })

  it('gives a new row a generated id', async () => {
    const calls = stubDbal()
    await register('alice', 'alice@example.com', 'pw')
    const row = JSON.parse(userCall(calls)?.body ?? '{}') as { id: string }
    expect(row.id).toMatch(/^[0-9a-f-]{36}$/)
  })

  // role is just as privileged as isInstanceOwner -- an anonymous request
  // could otherwise mint itself 'god' -- so creating the User row needs the
  // same admin authority already used to provision the Credential below,
  // not the plain unauthenticated db-client path.
  it('authenticates the User row creation with the admin token', async () => {
    process.env.DBAL_ADMIN_TOKEN = 'operator-token'
    const calls = stubDbal()
    await register('alice', 'alice@example.com', 'pw')
    expect(userCall(calls)?.auth).toBe('Bearer operator-token')
    delete process.env.DBAL_ADMIN_TOKEN
  })

  // The password is hashed by DBAL with Argon2id, which is what its OIDC
  // login verifies against -- hashing it here with anything else would
  // produce an account that cannot sign in.
  it('provisions the credential through DBAL rather than hashing here', async () => {
    const calls = stubDbal()
    await register('alice', 'alice@example.com', 'secret')
    expect(credentialCall(calls)?.url).toContain('/admin/credentials')
    expect(JSON.parse(credentialCall(calls)?.body ?? '{}')).toMatchObject({
      username: 'alice',
      password: 'secret',
    })
  })

  // `username` here is a system-generated community slug, not something a
  // founder was ever shown or asked to remember -- without the email also
  // recorded on the Credential, only that slug could ever sign back in,
  // even though the email is the one identifier the founder actually has.
  it('sends the email alongside the credential, not just the username', async () => {
    const calls = stubDbal()
    await register('alice', 'alice@example.com', 'secret')
    expect(JSON.parse(credentialCall(calls)?.body ?? '{}')).toMatchObject({
      email: 'alice@example.com',
    })
  })

  it('sends the admin token for the credential call too', async () => {
    process.env.DBAL_ADMIN_TOKEN = 'operator-token'
    const calls = stubDbal()
    await register('alice', 'alice@example.com', 'pw')
    expect(credentialCall(calls)?.auth).toBe('Bearer operator-token')
    delete process.env.DBAL_ADMIN_TOKEN
  })

  it('never writes the password into the user row', async () => {
    const calls = stubDbal()
    await register('alice', 'alice@example.com', 'secret')
    expect(userCall(calls)?.body).not.toContain('secret')
  })

  it('reports failure when the credential cannot be provisioned', async () => {
    stubDbal({ credentialOk: false })
    const result = await register('alice', 'alice@example.com', 'pw')
    expect(result.success).toBe(false)
    expect(result.error).toContain('Failed to provision credential')
  })

  it('reports failure rather than throwing when the user row cannot be created', async () => {
    stubDbal({ userOk: false })
    const result = await register('alice', 'alice@example.com', 'pw')
    expect(result.success).toBe(false)
    expect(result.error).toContain('Failed to create user')
  })

  it('reports failure rather than throwing when the write fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('dbal down')
      })
    )
    expect(await register('alice', 'a@b.c', 'pw')).toMatchObject({
      success: false,
      user: null,
      error: 'dbal down',
    })
  })

  describe('founding a named community', () => {
    it('creates the user under the given tenant, not system', async () => {
      const calls = stubDbal()
      await register('alice', 'alice@example.com', 'pw', 'acme')
      expect(client.db.entity).toHaveBeenCalledWith('User', 'acme')
      expect(userCall(calls)?.url).toContain('/acme/core/User')
      expect(JSON.parse(userCall(calls)?.body ?? '{}')).toMatchObject({
        tenantId: 'acme',
      })
    })

    it('sends the new tenant to DBAL when provisioning the credential', async () => {
      const calls = stubDbal()
      await register('alice', 'alice@example.com', 'pw', 'acme')
      expect(JSON.parse(credentialCall(calls)?.body ?? '{}')).toMatchObject({
        tenantId: 'acme',
      })
    })

    it('rejects founding a community whose name is already taken', async () => {
      ops.list.mockResolvedValueOnce({ data: [created] })
      const result = await register('bob', 'bob@example.com', 'pw', 'acme')
      expect(result.success).toBe(false)
      expect(result.error).toBe('That community name is already taken')
    })

    it('does not check for a name collision against the system tenant', async () => {
      // No tenantName -> no "is this community already founded" check at
      // all, since 'system' is the shared bucket every un-named signup
      // lands in and isn't "owned" by any single founder.
      stubDbal()
      await register('alice', 'alice@example.com', 'pw')
      expect(ops.list).toHaveBeenCalledTimes(2) // username + email only
    })

    it('treats a blank community name the same as none', async () => {
      stubDbal()
      await register('alice', 'alice@example.com', 'pw', '')
      expect(client.db.entity).toHaveBeenCalledWith('User', 'system')
    })
  })
})


/**
 * Every uniqueness check here is a guard reading a list, and listEntity
 * answers `{ data: [] }` on any error -- a DBAL timeout was indistinguish-
 * able from "nobody has that name". So a blip during signup made an
 * existing community name read as free, and the account below is then
 * created with role 'god' and the *existing* founder's tenantId: a full
 * God Panel takeover of somebody else's site, from the public signup form.
 *
 * A guard that cannot read its data has to refuse, not permit.
 */
describe('signing up while the data layer is unreachable', () => {
  const unreadable = { data: [], failed: true }

  const opsWhere = (overrides: Record<string, unknown>[]) => {
    const list = vi.fn()
    overrides.forEach(o => list.mockResolvedValueOnce(o))
    list.mockResolvedValue({ data: [] })
    return { list, create: vi.fn() }
  }

  it('refuses when it cannot tell if the community name is taken', async () => {
    const ops = opsWhere([unreadable])
    client.db.entity.mockReturnValue(ops)
    const calls = stubDbal()

    const result = await register(
      'alice',
      'alice@example.com',
      'pw',
      'harbour_cycle_works'
    )

    expect(result.success).toBe(false)
    // No account, and above all no Credential, inside a tenant it could
    // not confirm was free.
    expect(calls).toHaveLength(0)
  })

  it('refuses when it cannot tell if the username is taken', async () => {
    client.db.entity.mockReturnValue(opsWhere([{ data: [] }, unreadable]))
    const calls = stubDbal()

    const result = await register(
      'alice',
      'alice@example.com',
      'pw',
      'harbour_cycle_works'
    )

    expect(result.success).toBe(false)
    expect(calls).toHaveLength(0)
  })

  it('refuses when it cannot tell if the email is taken', async () => {
    client.db.entity.mockReturnValue(
      opsWhere([{ data: [] }, { data: [] }, unreadable])
    )
    const calls = stubDbal()

    const result = await register(
      'alice',
      'alice@example.com',
      'pw',
      'harbour_cycle_works'
    )

    expect(result.success).toBe(false)
    expect(calls).toHaveLength(0)
  })

  // The message must not tell an anonymous caller whether the name exists.
  it('does not report it as the name being taken', async () => {
    client.db.entity.mockReturnValue(opsWhere([unreadable]))
    stubDbal()

    const result = await register(
      'alice',
      'alice@example.com',
      'pw',
      'harbour_cycle_works'
    )

    expect(result.error).not.toContain('already taken')
  })

  it('still creates the account when the checks come back clean', async () => {
    client.db.entity.mockReturnValue(opsWhere([]))
    const calls = stubDbal()

    const result = await register(
      'alice',
      'alice@example.com',
      'pw',
      'harbour_cycle_works'
    )

    expect(result.success).toBe(true)
    expect(calls.length).toBeGreaterThan(0)
  })
})


/**
 * The User row is written, then the Credential is provisioned, and the
 * catch rolled nothing back. A community name that DBAL then refused as a
 * username -- or a password it refused as too long -- left the row behind:
 * the retry read the name as already taken (any user in the tenant), and
 * the founder could neither sign in nor start over. The name was burned.
 */
describe('a registration that fails after writing the user', () => {
  it('removes the row it wrote, so the name is not burned', async () => {
    const calls = stubDbal({ credentialOk: false })

    const result = await register('alice', 'a@b.c', 'pw', 'harbour')

    expect(result.success).toBe(false)
    // The id the row was written under -- not the one the create echoed,
    // which a real DBAL may not repeat back at all.
    const written = JSON.parse(userCall(calls)?.body ?? '{}') as {
      id?: string
    }
    const removal = calls.find(
      c =>
        c.method === 'DELETE' &&
        c.url.endsWith(`/harbour/core/User/${String(written.id)}`)
    )
    expect(removal).toBeDefined()
    // As the operator: the row was written that way and nothing else may
    // remove it.
    expect(removal?.auth).toMatch(/^Bearer /)
  })

  it('still reports the reason provisioning failed', async () => {
    stubDbal({ credentialOk: false })
    const result = await register('alice', 'a@b.c', 'pw', 'harbour')
    expect(result.error).toContain('credential')
  })

  it('removes nothing when provisioning succeeded', async () => {
    const calls = stubDbal()
    await register('alice', 'a@b.c', 'pw', 'harbour')
    expect(calls.some(c => c.method === 'DELETE')).toBe(false)
  })
})

/**
 * The stub above answers a create with the whole row. A real DBAL echoes
 * `{data: {id}}` and nothing else -- confirmed against the daemon: a
 * signup came back `{"user":{"id":"stub","tenantId":null,...}}` with no
 * username, no email, no role. Everything here was read off that echo,
 * so the API described an account it had just written as though it knew
 * nothing about it, `createdAt` was NaN, and the rollback below aimed at
 * whatever id the echo happened to carry.
 */
describe('when the data layer echoes only an id', () => {
  const thinEcho = ({ credentialOk = true } = {}): Call[] => {
    const calls: Call[] = []
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init?: RequestInit) => {
        calls.push({
          url: String(url),
          method: init?.method,
          auth: (init?.headers as Record<string, string>)?.Authorization,
          body: init?.body as string | undefined,
        })
        const isCredential = String(url).includes('/admin/credentials')
        const ok = isCredential ? credentialOk : true
        return {
          ok,
          status: ok ? 200 : 403,
          json: async () => ({ success: true, data: { id: 'echoed' } }),
          text: async () => 'refused',
        } as Response
      })
    )
    return calls
  }

  it('describes the account it just wrote', async () => {
    thinEcho()

    const result = await register('alice', 'alice@example.com', 'pw', 'acme')

    expect(result.success).toBe(true)
    expect(result.user).toMatchObject({
      username: 'alice',
      email: 'alice@example.com',
      role: 'god',
      tenantId: 'acme',
      isInstanceOwner: false,
    })
  })

  it('gives the account a real creation time, not NaN', async () => {
    thinEcho()

    const result = await register('alice', 'alice@example.com', 'pw', 'acme')

    expect(Number.isFinite(result.user?.createdAt)).toBe(true)
  })

  it('reports the id it wrote the row under', async () => {
    const calls = thinEcho()

    const result = await register('alice', 'alice@example.com', 'pw', 'acme')

    const written = JSON.parse(userCall(calls)?.body ?? '{}') as {
      id?: string
    }
    expect(result.user?.id).toBe(written.id)
  })

  /**
   * The undo for a failed credential has to name the row that was
   * actually written. Aimed at the echo, it deleted nothing -- and the
   * orphan it left is what burns the community name for good.
   */
  it('rolls back the row it wrote, not whatever the echo named', async () => {
    const calls = thinEcho({ credentialOk: false })

    await register('alice', 'alice@example.com', 'pw', 'harbour')

    const written = JSON.parse(userCall(calls)?.body ?? '{}') as {
      id?: string
    }
    const deleted = calls.find(c => c.method === 'DELETE')
    expect(deleted?.url).toContain(`/harbour/core/User/${String(written.id)}`)
    expect(deleted?.url).not.toContain('/echoed')
    expect(deleted?.url).not.toContain('undefined')
  })
})
