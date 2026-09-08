import { describe, expect, it } from 'vitest'

import {
  buildRegisterPayload,
  tenantNameFor,
  canSubmit,
  communityNameError,
  slugify,
} from './signup-form'

describe('slugify', () => {
  it('lowercases and hyphenates spaces', () => {
    expect(slugify('Acme Running Club')).toBe('acme-running-club')
  })

  it('drops characters that are not letters, digits or hyphens', () => {
    expect(slugify("Alex's Café!")).toBe('alexs-caf')
  })

  it('caps the length at 40', () => {
    expect(slugify('a'.repeat(100))).toHaveLength(40)
  })

  it('collapses repeated whitespace to one hyphen', () => {
    expect(slugify('a   b')).toBe('a-b')
  })

  it('is empty for a name with nothing sluggable', () => {
    expect(slugify('日本語')).toBe('')
  })
})

describe('communityNameError', () => {
  // Three, not two: the slug becomes the founder's username and DBAL's
  // isValidUsername refuses under three. "AB" wrote the User row, had its
  // Credential refused, and left an orphan the retry read as taken.
  it('accepts a name of three or more characters', () => {
    expect(communityNameError('abc')).toBeNull()
  })

  it.each(['', 'a', 'ab', '  '])('refuses %p', community => {
    expect(communityNameError(community)).toBe(
      'Community name must be at least 3 characters.'
    )
  })

  /**
   * The length rule counted the raw string while slugify strips everything
   * outside [a-z0-9-]. So a name like these passed validation, slugged to
   * '', and buildRegisterPayload sent tenantName: ''. register() reads an
   * empty tenantName as "no community was named", skips the already-taken
   * check entirely, and creates the account with role 'god' inside the
   * shared 'system' tenant -- a founder who thought they were starting
   * their own community, given the God Panel over everyone else's.
   */
  it.each(['日本語', '!!', '---', '   —   '])(
    'refuses %p, which produces no usable address',
    community => {
      expect(communityNameError(community)).not.toBeNull()
    }
  )

  it('says what is wrong rather than repeating the length rule', () => {
    expect(communityNameError('日本語')).toContain('letters')
  })

  it('still accepts a name that only partly survives slugging', () => {
    expect(communityNameError('Harbour Cycle Works!')).toBeNull()
  })

  it('trims before counting', () => {
    expect(communityNameError(' a ')).not.toBeNull()
    expect(communityNameError(' abc ')).toBeNull()
  })
})

const fields = (over: Partial<Parameters<typeof canSubmit>[0]> = {}) => ({
  community: 'Acme',
  name: 'Alex',
  email: 'alex@example.com',
  password: 'longenough',
  tier: 'creator' as const,
  ...over,
})

describe('canSubmit', () => {
  it('is true when every field has something in it', () => {
    expect(canSubmit(fields())).toBe(true)
  })

  it.each(['community', 'name', 'email', 'password'])(
    'is false when %s is blank',
    field => {
      expect(canSubmit(fields({ [field]: '' }))).toBe(false)
    }
  )

  it('treats whitespace-only text as blank, except for the password', () => {
    expect(canSubmit(fields({ community: '   ' }))).toBe(false)
  })
})

describe('buildRegisterPayload', () => {
  it('derives the username from the community slug', () => {
    expect(buildRegisterPayload(fields()).username).toBe('acme')
  })

  // A community name made only of characters that don't survive slugify
  // would otherwise register a blank username.
  it('falls back to the person\'s name when the slug is empty', () => {
    expect(buildRegisterPayload(fields({ community: '日本語' })).username).toBe(
      'alex'
    )
  })

  it('carries email and password straight through', () => {
    const payload = buildRegisterPayload(fields())
    expect(payload.email).toBe('alex@example.com')
    expect(payload.password).toBe('longenough')
  })

  it('sends the tenant slug and the chosen plan', () => {
    const payload = buildRegisterPayload(fields({ tier: 'studio' }))
    expect(payload.tenantName).toBe('acme')
    expect(payload.plan).toBe('studio')
  })

  // DBAL's route parser only accepts alphanumeric + underscore in a
  // tenant segment (rpc_restful_handler.cpp's is_valid_name) -- a hyphen
  // there 400s the whole request with "Invalid tenant name", which is
  // exactly what slugify() produces for any multi-word community name.
  // The username field isn't a URL path segment, so it keeps the
  // hyphenated, more URL-conventional slug unchanged.
  it('sends an underscore tenantName even for a multi-word community', () => {
    const payload = buildRegisterPayload(fields({ community: 'Acme Club' }))
    expect(payload.tenantName).toBe('acme_club')
    expect(payload.username).toBe('acme-club')
  })
})

/**
 * The signup screen showed metabuilder.app/acme-running-club while
 * creating acme_running_club -- DBAL's route parser takes only
 * alphanumerics and underscores, and tenant-exists refuses a hyphen
 * before any request. The one URL the form promised was the one that
 * could not work. Deriving the name once keeps the hint and the payload
 * from drifting again.
 */
describe('tenantNameFor', () => {
  it('is what the payload actually sends', () => {
    const fields = {
      community: 'Acme Running Club',
      name: 'Alex',
      email: 'a@b.c',
      password: 'pw',
      tier: 'starter' as const,
    }
    expect(buildRegisterPayload(fields).tenantName).toBe(
      tenantNameFor('Acme Running Club')
    )
  })

  it('uses underscores, which a tenant path can hold', () => {
    expect(tenantNameFor('Acme Running Club')).toBe('acme_running_club')
    expect(tenantNameFor('Acme Running Club')).not.toContain('-')
  })
})
