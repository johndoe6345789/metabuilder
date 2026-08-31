import { describe, expect, it } from 'vitest'

import { resolveTenantId } from './resolve-tenant-id'

describe('resolveTenantId', () => {
  it('prefers a direct tenantId', () => {
    expect(resolveTenantId({ tenantId: 't1', tenant: { id: 't2' } })).toBe(
      't1'
    )
  })

  it('falls back to tenant.id', () => {
    expect(resolveTenantId({ tenant: { id: 't2' } })).toBe('t2')
  })

  it('ignores an empty tenantId string', () => {
    expect(resolveTenantId({ tenantId: '', tenant: { id: 't2' } })).toBe('t2')
  })

  it('returns undefined with no context', () => {
    expect(resolveTenantId()).toBeUndefined()
  })

  it('returns undefined when neither field is set', () => {
    expect(resolveTenantId({})).toBeUndefined()
  })

  it('returns undefined when tenant.id is null', () => {
    expect(resolveTenantId({ tenant: { id: null } })).toBeUndefined()
  })
})
