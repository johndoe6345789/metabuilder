import { beforeEach, describe, expect, it, vi } from 'vitest'

import { validateTenantAccess } from './index'

const user = (role: string, tenantId: string | null = 't1') => ({
  id: 'u1',
  role,
  tenantId,
})

describe('validateTenantAccess', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('with no user', () => {
    it('allows a route that asks for no level', async () => {
      await expect(validateTenantAccess(null, 'acme', 0)).resolves.toEqual({
        allowed: true,
      })
    })

    it('refuses a route that requires any level', async () => {
      const result = await validateTenantAccess(null, 'acme', 1)

      expect(result.allowed).toBe(false)
      expect(result.reason).toBe('Authentication required')
    })

    it('requires a level by default', async () => {
      // The default must be the closed one; an omitted minLevel that meant
      // "public" would silently open every caller that forgets it.
      const result = await validateTenantAccess(null, 'acme')
      expect(result.allowed).toBe(false)
    })
  })

  describe('permission level', () => {
    it('refuses a user below the required level', async () => {
      const result = await validateTenantAccess(user('user'), 'acme', 99)

      expect(result.allowed).toBe(false)
      expect(result.reason).toContain('Insufficient permissions')
    })

    it('names both levels in the reason', async () => {
      const result = await validateTenantAccess(user('user'), 'acme', 99)
      expect(result.reason).toMatch(/Required level: 99/)
    })

    it('refuses before asking anything about the community', async () => {
      const result = await validateTenantAccess(user('user'), 'acme', 99)
      expect(result.tenant).toBeUndefined()
    })
  })

  /**
   * Membership used to be answered by listing a `Tenant` entity, which
   * does not exist -- tenant-exists.ts says so outright. The request 404'd,
   * listEntity swallowed that into an empty list, and an empty list reads
   * exactly like "no such tenant": every caller below god was refused with
   * "Tenant not found" across the whole /api/v1 surface, which is what
   * EntityListView and its siblings run on. This test mocked the entity
   * in, so it agreed with a lookup that could never work.
   *
   * The account already carries the community it belongs to.
   */
  describe('membership', () => {
    it('allows a member of the community the route names', async () => {
      const result = await validateTenantAccess(user('user', 'acme'), 'acme', 1)

      expect(result.allowed).toBe(true)
      expect(result.tenant).toEqual({ id: 'acme' })
    })

    it('refuses a member of a different one', async () => {
      const result = await validateTenantAccess(user('user', 't1'), 'acme', 1)

      expect(result.allowed).toBe(false)
      expect(result.reason).toBe('Not a member of this tenant')
    })

    it('refuses an account naming no community at all', async () => {
      const result = await validateTenantAccess(user('user', null), 'acme', 1)
      expect(result.allowed).toBe(false)
    })

    // The same rule the DBAL proxy and the asset routes apply: a god is
    // one community's founder, not an instance-wide admin. This used to
    // let any god into any tenant, which the other two refuse.
    it('refuses a god from another community', async () => {
      const result = await validateTenantAccess(user('god', 'other'), 'acme', 1)
      expect(result.allowed).toBe(false)
    })

    it('allows a god within their own', async () => {
      const result = await validateTenantAccess(user('god', 'acme'), 'acme', 1)
      expect(result.allowed).toBe(true)
    })

    it('lets the instance owner reach any', async () => {
      const result = await validateTenantAccess(user('supergod', null), 'x', 1)
      expect(result.allowed).toBe(true)
    })
  })
})
