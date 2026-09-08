import { describe, expect, it } from 'vitest'

import { isPublicWrite } from './public-writes'

describe('what a signed-out visitor may create', () => {
  it('lets someone book a repair without an account', () => {
    expect(
      isPublicWrite('POST', 'harbour_cycle_works/core/FormSubmission')
    ).toBe(true)
  })

  it('lets someone register', () => {
    // User was here for registration's sake and registration never used
    // it -- register.ts goes to DBAL directly with the admin token. What
    // it did allow was a stranger creating a User row inside somebody
    // else's community, and conjuring a tenant out of a made-up slug,
    // since tenant-exists decides a tenant is real if it has any users.
    expect(isPublicWrite('POST', 'system/core/User')).toBe(false)
    expect(isPublicWrite('POST', 'harbour_cycle_works/core/User')).toBe(false)
  })

  it('does not open anything else', () => {
    expect(isPublicWrite('POST', 'acme/core/Workflow')).toBe(false)
    expect(isPublicWrite('POST', 'acme/access/PageConfig')).toBe(false)
    expect(isPublicWrite('POST', 'acme/access/Credential')).toBe(false)
  })

  /**
   * A visitor may say something; they do not get to go back and change
   * what they said, or remove somebody else's.
   */
  it.each(['PUT', 'PATCH', 'DELETE'])('never opens %s', method => {
    expect(
      isPublicWrite(method, 'harbour_cycle_works/core/FormSubmission')
    ).toBe(false)
  })

  // A longer path addresses a row or an action on one, not a create.
  it('does not open a POST at a particular row', () => {
    expect(
      isPublicWrite('POST', 'acme/core/FormSubmission/fs_1')
    ).toBe(false)
    expect(
      isPublicWrite('POST', 'acme/core/FormSubmission/fs_1/approve')
    ).toBe(false)
  })

  it('is not fooled by an entity name appearing earlier in the path', () => {
    expect(isPublicWrite('POST', 'FormSubmission/core/Workflow')).toBe(false)
  })

  it('ignores a path that is not entity-shaped', () => {
    expect(isPublicWrite('POST', 'admin/seed')).toBe(false)
    expect(isPublicWrite('POST', '')).toBe(false)
  })
})
