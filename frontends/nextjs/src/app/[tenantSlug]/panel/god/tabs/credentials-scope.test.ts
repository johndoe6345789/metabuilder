import { describe, expect, it } from 'vitest'

import {
  availableTenants,
  canManageAccount,
  effectiveScope,
  outranksViewer,
  visibleAccounts,
} from './credentials-scope'
import type { UserRecord } from './credentials-types'

const account = (over: Partial<UserRecord> = {}): UserRecord => ({
  username: 'alice',
  role: 'user',
  tenantId: 'acme',
  ...over,
})

const god = { isSupergod: false, level: 4, tenant: 'acme' }
const supergod = { isSupergod: true, level: 5, tenant: 'acme' }

describe('availableTenants', () => {
  it('always offers the viewer\'s own tenant and system', () => {
    expect(availableTenants('acme', [])).toEqual(['acme', 'system'])
  })

  it('adds every tenant id and slug it was given', () => {
    expect(
      availableTenants('acme', [{ id: 't1', slug: 'beta' }])
    ).toEqual(['acme', 'beta', 'system', 't1'])
  })

  it('does not repeat a tenant that is already the viewer\'s own', () => {
    expect(availableTenants('acme', [{ id: 'acme' }])).toEqual([
      'acme',
      'system',
    ])
  })

  it('ignores blank ids and slugs', () => {
    expect(
      availableTenants('acme', [{ id: '', slug: '' }, { id: 'ok' }])
    ).toEqual(['acme', 'ok', 'system'])
  })

  it('sorts them so the list does not reorder between loads', () => {
    const list = availableTenants('zulu', [{ id: 'mike' }, { id: 'alpha' }])
    expect(list).toEqual([...list].sort((a, b) => a.localeCompare(b)))
  })
})

describe('effectiveScope', () => {
  it('honours a supergod\'s choice', () => {
    expect(effectiveScope(true, 'all', 'acme')).toBe('all')
    expect(effectiveScope(true, 'other', 'acme')).toBe('other')
  })

  // The selector is only rendered for a supergod, but the rule must hold
  // regardless of what value reaches it: a god cannot widen their view.
  it.each(['all', 'other', 'system'])(
    'pins a god to their own tenant whatever %p is chosen',
    chosen => {
      expect(effectiveScope(false, chosen, 'acme')).toBe('acme')
    }
  )
})

describe('visibleAccounts', () => {
  const accounts = [
    account(),
    account({ username: 'bob', tenantId: 'other' }),
    account({ username: 'sys', tenantId: null }),
  ]

  it('shows everything under the all scope', () => {
    expect(visibleAccounts(accounts, 'all')).toHaveLength(3)
  })

  it('shows only the named tenant', () => {
    expect(visibleAccounts(accounts, 'acme').map(a => a.username)).toEqual([
      'alice',
    ])
  })

  // A row with no tenant belongs to system, not to everyone.
  it('treats an absent tenant as system', () => {
    expect(visibleAccounts(accounts, 'system').map(a => a.username)).toEqual([
      'sys',
    ])
  })

  it('is empty for a tenant with no accounts', () => {
    expect(visibleAccounts(accounts, 'nobody')).toEqual([])
  })
})

describe('canManageAccount', () => {
  it('lets a god manage an account in their own tenant', () => {
    expect(canManageAccount(account(), god)).toBe(true)
  })

  // The isolation rule: a god's reach stops at their tenant boundary.
  it('refuses a god an account in another tenant', () => {
    expect(canManageAccount(account({ tenantId: 'other' }), god)).toBe(false)
  })

  // The escalation rule: setting a password is taking the account, so a
  // god must not be able to reset one that outranks them.
  it('refuses a god an account that outranks them', () => {
    expect(canManageAccount(account({ role: 'supergod' }), god)).toBe(false)
  })

  it('lets a god manage an account at their own level', () => {
    expect(canManageAccount(account({ role: 'god' }), god)).toBe(true)
  })

  it('lets a supergod manage any account in any tenant', () => {
    expect(
      canManageAccount(
        account({ tenantId: 'other', role: 'supergod' }),
        supergod
      )
    ).toBe(true)
  })

  it('treats an account with no role as an ordinary user', () => {
    expect(canManageAccount(account({ role: undefined }), god)).toBe(true)
  })

  it('refuses a lower-level viewer an admin account', () => {
    const moderator = { isSupergod: false, level: 2, tenant: 'acme' }
    expect(canManageAccount(account({ role: 'admin' }), moderator)).toBe(false)
  })
})

describe('outranksViewer', () => {
  it('is false for a supergod, who outranks nobody by this rule', () => {
    expect(outranksViewer(account({ role: 'supergod' }), supergod)).toBe(false)
  })

  it('is true when the account is above a god', () => {
    expect(outranksViewer(account({ role: 'supergod' }), god)).toBe(true)
  })

  it('is false at the same level', () => {
    expect(outranksViewer(account({ role: 'god' }), god)).toBe(false)
  })
})
