import { beforeEach, describe, expect, it, vi } from 'vitest'

const list = vi.fn()

vi.mock('@/lib/db-client', () => ({
  db: { entity: () => ({ list }) },
}))

import { validateTenantAccess } from './index'

const user = (role: string, tenantId: string | null = 't1') => ({
  id: 'u1',
  role,
  tenantId,
})

describe('validateTenantAccess', () => {
  beforeEach(() => {
    list.mockReset()
    list.mockResolvedValue({ data: [] })
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

    it('does not query for a user it has already refused', async () => {
      await validateTenantAccess(user('user'), 'acme', 99)
      expect(list).not.toHaveBeenCalled()
    })
  })

  describe('god and above', () => {
    it('reaches any tenant without a lookup', async () => {
      const result = await validateTenantAccess(user('god', 'other'), 'acme', 1)

      expect(result.allowed).toBe(true)
      expect(result.tenant).toEqual({ id: 'acme' })
      // There is no Tenant entity in DBAL, so a lookup would always fail.
      expect(list).not.toHaveBeenCalled()
    })

    it('does the same for supergod', async () => {
      const result = await validateTenantAccess(user('supergod', null), 'x', 1)
      expect(result.allowed).toBe(true)
    })
  })

  describe('ordinary members', () => {
    it('refuses when the tenant does not exist', async () => {
      list.mockResolvedValue({ data: [] })

      const result = await validateTenantAccess(user('user'), 'ghost', 1)

      expect(result.allowed).toBe(false)
      expect(result.reason).toBe('Tenant not found: ghost')
    })

    it('refuses a member of a different tenant', async () => {
      list.mockResolvedValue({ data: [{ id: 'other' }] })

      const result = await validateTenantAccess(user('user', 't1'), 'acme', 1)

      expect(result.allowed).toBe(false)
      expect(result.reason).toBe('Not a member of this tenant')
    })

    it('allows a member of the matching tenant', async () => {
      list.mockResolvedValue({ data: [{ id: 't1', slug: 'acme' }] })

      const result = await validateTenantAccess(user('user', 't1'), 'acme', 1)

      expect(result.allowed).toBe(true)
      expect(result.tenant).toEqual({ id: 't1', slug: 'acme' })
    })

    it('refuses a user with no tenant at all', async () => {
      list.mockResolvedValue({ data: [{ id: 't1' }] })

      const result = await validateTenantAccess(user('user', null), 'acme', 1)

      expect(result.allowed).toBe(false)
    })

    it('looks the tenant up by slug', async () => {
      list.mockResolvedValue({ data: [{ id: 't1' }] })

      await validateTenantAccess(user('user'), 'acme', 1)

      expect(list).toHaveBeenCalledWith({ filter: { slug: 'acme' } })
    })
  })

  describe('when the lookup fails', () => {
    it('refuses rather than failing open', async () => {
      list.mockRejectedValue(new Error('DBAL unreachable'))

      const result = await validateTenantAccess(user('user'), 'acme', 1)

      expect(result.allowed).toBe(false)
      expect(result.reason).toBe('DBAL unreachable')
    })

    it('refuses on a non-Error rejection too', async () => {
      list.mockRejectedValue('nope')

      const result = await validateTenantAccess(user('user'), 'acme', 1)

      expect(result.allowed).toBe(false)
      expect(result.reason).toBe('Validation failed')
    })
  })
})
