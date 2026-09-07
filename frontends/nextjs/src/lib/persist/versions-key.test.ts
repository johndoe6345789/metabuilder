import { describe, expect, it } from 'vitest'

import { versionsKey } from './versions-key'

/**
 * Snapshots live in IndexedDB, which is scoped to the origin and nothing
 * finer. The key was the bare string 'god.workflow', so tenant A published
 * a workflow, tenant B signed in on the same browser, opened History --
 * and saw A's workflow names and timestamps, one click from loading A's
 * whole graph into their own editor and publishing it.
 *
 * resetTenantOwned clears the Redux slice on a tenant switch; it cannot
 * reach IndexedDB, so the guard has to be in the key itself.
 */
describe('where a tenant’s version history lives', () => {
  it('keeps one community’s history out of another’s', () => {
    expect(versionsKey('god.workflow', 'acme')).not.toBe(
      versionsKey('god.workflow', 'harbour_cycle_works')
    )
  })

  it('keeps one kind of history out of another’s', () => {
    expect(versionsKey('god.workflow', 'acme')).not.toBe(
      versionsKey('god.componentTree', 'acme')
    )
  })

  it('is stable for the same community and kind', () => {
    expect(versionsKey('god.workflow', 'acme')).toBe(
      versionsKey('god.workflow', 'acme')
    )
  })

  it('normalizes the tenant, so one community has one history', () => {
    expect(versionsKey('god.workflow', 'acme/sub')).toBe(
      versionsKey('god.workflow', 'acme-sub')
    )
  })

  it('names both, so a stored key can be recognised', () => {
    const key = versionsKey('god.workflow', 'acme')
    expect(key).toContain('god.workflow')
    expect(key).toContain('acme')
  })
})
