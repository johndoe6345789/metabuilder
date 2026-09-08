import { describe, expect, it } from 'vitest'

import { communitiesFromUsers, type UserRow } from './communities-from-users'

const user = (over: Partial<UserRow>): UserRow => ({
  id: 'u1',
  username: 'someone',
  role: 'user',
  tenantId: 'acme',
  createdAt: 1751500000,
  ...over,
})

/**
 * The tab asked `/system/core/tenant` for a list. There is no Tenant
 * entity -- the same wrong assumption that made validateTenantAccess
 * refuse everyone -- so it 404'd and the tab showed nothing, always.
 */
describe('communitiesFromUsers', () => {
  it('is one entry per community someone belongs to', () => {
    const found = communitiesFromUsers([
      user({ tenantId: 'acme' }),
      user({ id: 'u2', tenantId: 'acme' }),
      user({ id: 'u3', tenantId: 'harbour', createdAt: 1751600000 }),
    ])
    expect(found.map(c => c.id)).toEqual(['acme', 'harbour'])
  })

  it('counts the members of each', () => {
    const found = communitiesFromUsers([
      user({}),
      user({ id: 'u2' }),
      user({ id: 'u3', tenantId: 'other' }),
    ])
    expect(found.map(c => c.members)).toEqual([2, 1])
  })

  it('names the god as the founder', () => {
    const [community] = communitiesFromUsers([
      user({ id: 'u1', username: 'member' }),
      user({ id: 'u2', username: 'rosa', role: 'god' }),
    ])
    expect(community.ownerName).toBe('rosa')
    expect(community.ownerId).toBe('u2')
  })

  it('says so when a community has no god in it', () => {
    const [community] = communitiesFromUsers([user({})])
    expect(community.ownerName).toBe('no founder')
  })

  // Accounts stamp seconds; read as milliseconds every community would
  // date to January 1970.
  it('starts a community at its earliest account', () => {
    const [community] = communitiesFromUsers([
      user({ id: 'u1', createdAt: 1751600000 }),
      user({ id: 'u2', createdAt: 1751500000 }),
    ])
    expect(community.createdAt).toBe(1751500000000)
  })

  it('leaves the date at zero when no account carries one', () => {
    const [community] = communitiesFromUsers([user({ createdAt: null })])
    expect(community.createdAt).toBe(0)
  })

  it('ignores an account with no community', () => {
    expect(communitiesFromUsers([user({ tenantId: undefined })])).toEqual([])
    expect(communitiesFromUsers([user({ tenantId: '' })])).toEqual([])
  })

  it('is empty for nobody', () => {
    expect(communitiesFromUsers([])).toEqual([])
  })

  it('puts the oldest community first', () => {
    const found = communitiesFromUsers([
      user({ tenantId: 'newer', createdAt: 1751600000 }),
      user({ id: 'u2', tenantId: 'older', createdAt: 1751500000 }),
    ])
    expect(found.map(c => c.id)).toEqual(['older', 'newer'])
  })
})
