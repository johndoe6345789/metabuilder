import { describe, expect, it } from 'vitest'

import { CROSS_TENANT_LEVEL, canUserAccessWorkflow } from './context-access'

describe('canUserAccessWorkflow', () => {
  it('allows a user into their own tenant at any level', () => {
    expect(canUserAccessWorkflow('acme', 0, 'acme')).toBe(true)
    expect(canUserAccessWorkflow('acme', 1, 'acme')).toBe(true)
  })

  it('refuses another tenant below the cross-tenant level', () => {
    expect(canUserAccessWorkflow('acme', 3, 'other')).toBe(false)
  })

  it('allows another tenant at or above the cross-tenant level', () => {
    expect(canUserAccessWorkflow('acme', CROSS_TENANT_LEVEL, 'other')).toBe(
      true
    )
    expect(canUserAccessWorkflow('acme', 5, 'other')).toBe(true)
  })

  it('treats the boundary as inclusive', () => {
    // One below must fail and the level itself must pass; an off-by-one here
    // either locks admins out or lets moderators cross tenants.
    expect(canUserAccessWorkflow('a', CROSS_TENANT_LEVEL - 1, 'b')).toBe(false)
    expect(canUserAccessWorkflow('a', CROSS_TENANT_LEVEL, 'b')).toBe(true)
  })

  it('compares tenant ids exactly, without case folding', () => {
    // Tenant ids are slugs; "Acme" is not "acme" and must not be treated as
    // the same tenant by accident.
    expect(canUserAccessWorkflow('Acme', 0, 'acme')).toBe(false)
  })

  it('does not treat an empty tenant id as a wildcard', () => {
    expect(canUserAccessWorkflow('', 0, 'acme')).toBe(false)
  })
})
