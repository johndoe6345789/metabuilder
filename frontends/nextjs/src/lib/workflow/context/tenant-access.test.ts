import { describe, expect, it } from 'vitest'

import { checkTenantAccess, SUPER_ADMIN_LEVEL } from './tenant-access'

const workflow = { id: 'wf1', tenantId: 'acme' }
const request = (over = {}) => ({
  tenantId: 'acme',
  userId: 'u1',
  userLevel: 2,
  ...over,
})

describe('checkTenantAccess', () => {
  it('allows a user working inside their own tenant', () => {
    expect(checkTenantAccess(workflow, request(), {})).toEqual({
      allowed: true,
      crossTenant: false,
    })
  })

  it.each([1, 2, 3, 4])(
    'allows level %i inside their own tenant',
    userLevel => {
      const outcome = checkTenantAccess(workflow, request({ userLevel }), {})
      expect(outcome.allowed).toBe(true)
    }
  )

  // The isolation rule: another tenant's workflow is not reachable, and
  // the refusal names both tenants so an operator can see why.
  it.each([1, 2, 3])('refuses level %i across tenants', userLevel => {
    const outcome = checkTenantAccess(
      workflow,
      request({ tenantId: 'other', userLevel }),
      { allowCrossTenantAccess: true }
    )
    expect(outcome.allowed).toBe(false)
    if (!outcome.allowed) {
      expect(outcome.reason).toContain('acme')
      expect(outcome.reason).toContain('other')
    }
  })

  it('refuses a super-admin unless cross-tenant access is enabled', () => {
    const outcome = checkTenantAccess(
      workflow,
      request({ tenantId: 'other', userLevel: SUPER_ADMIN_LEVEL }),
      {}
    )
    expect(outcome.allowed).toBe(false)
  })

  it('allows a super-admin when it is enabled, and says it was crossed', () => {
    expect(
      checkTenantAccess(
        workflow,
        request({ tenantId: 'other', userLevel: SUPER_ADMIN_LEVEL }),
        { allowCrossTenantAccess: true }
      )
    ).toEqual({ allowed: true, crossTenant: true })
  })

  // Only an explicit true opens the gate; a missing option is not consent.
  it.each([undefined, false])(
    'treats allowCrossTenantAccess=%p as closed',
    allowCrossTenantAccess => {
      const outcome = checkTenantAccess(
        workflow,
        request({ tenantId: 'other', userLevel: 5 }),
        { allowCrossTenantAccess }
      )
      expect(outcome.allowed).toBe(false)
    }
  )

  it('does not consult the option for a same-tenant run', () => {
    expect(
      checkTenantAccess(workflow, request(), {
        allowCrossTenantAccess: false,
      }).allowed
    ).toBe(true)
  })
})
