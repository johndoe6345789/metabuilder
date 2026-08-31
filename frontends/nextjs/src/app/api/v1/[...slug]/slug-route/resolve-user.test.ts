import { describe, it, expect } from 'vitest'
import { resolveUser } from './resolve-user'

describe('resolveUser', () => {
  it('passes null through unchanged', () => {
    expect(resolveUser(null)).toBeNull()
  })

  it('normalizes a well-formed session record', () => {
    expect(resolveUser({ id: 'u1', role: 'admin', tenantId: 'acme' })).toEqual(
      { id: 'u1', role: 'admin', tenantId: 'acme' }
    )
  })

  it('defaults a non-string role to public rather than widening access', () => {
    expect(resolveUser({ id: 'u1', role: 7 })?.role).toBe('public')
  })

  it('defaults a missing id to an empty string', () => {
    expect(resolveUser({ role: 'user' })?.id).toBe('')
  })

  it('defaults a non-string tenantId to null', () => {
    expect(
      resolveUser({ id: 'u1', role: 'user', tenantId: 7 })?.tenantId
    ).toBe(null)
  })
})
