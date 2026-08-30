import { describe, expect, it } from 'vitest'

import {
  buildRegisterPayload,
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
  it('accepts a name of two or more characters', () => {
    expect(communityNameError('ab')).toBeNull()
  })

  it.each(['', 'a', '  '])('refuses %p', community => {
    expect(communityNameError(community)).toBe(
      'Community name must be at least 2 characters.'
    )
  })

  it('trims before counting', () => {
    expect(communityNameError(' a ')).not.toBeNull()
    expect(communityNameError(' ab ')).toBeNull()
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
})
