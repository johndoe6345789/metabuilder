import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const master = vi.hoisted(() => ({ getVaultMasterPassword: vi.fn() }))
vi.mock('@/lib/vault/master-password', () => master)

import {
  createVaultSessionToken,
  getExpectedVaultSessionToken,
  hasValidVaultSession,
  safeTokenEqual,
  VAULT_COOKIE_NAME,
} from './vault-session'

const withCookie = (cookie: string | null): Request =>
  new Request('http://localhost/api/vault', {
    headers: cookie === null ? {} : { cookie },
  })

beforeEach(() => master.getVaultMasterPassword.mockReturnValue('hunter2'))
afterEach(() => vi.clearAllMocks())

describe('createVaultSessionToken', () => {
  it('derives a 32-byte hex token', () => {
    expect(createVaultSessionToken('hunter2')).toMatch(/^[0-9a-f]{64}$/)
  })

  it('is deterministic for the same password', () => {
    expect(createVaultSessionToken('a')).toBe(createVaultSessionToken('a'))
  })

  it('does not contain the password it was derived from', () => {
    expect(createVaultSessionToken('hunter2')).not.toContain('hunter2')
  })

  it('separates passwords that differ by one character', () => {
    expect(createVaultSessionToken('hunter2')).not.toBe(
      createVaultSessionToken('hunter3')
    )
  })
})

describe('getExpectedVaultSessionToken', () => {
  it('is null when no master password is configured', () => {
    master.getVaultMasterPassword.mockReturnValue(null)
    expect(getExpectedVaultSessionToken()).toBeNull()
  })

  it('matches a token derived from the configured password', () => {
    expect(getExpectedVaultSessionToken()).toBe(
      createVaultSessionToken('hunter2')
    )
  })
})

describe('safeTokenEqual', () => {
  it('accepts identical strings', () => {
    expect(safeTokenEqual('abc', 'abc')).toBe(true)
  })

  it('rejects different strings of equal length', () => {
    expect(safeTokenEqual('abc', 'abd')).toBe(false)
  })

  // timingSafeEqual throws on a length mismatch rather than returning
  // false, so the length guard is the thing under test here.
  it('rejects a length mismatch without throwing', () => {
    expect(safeTokenEqual('abc', 'abcd')).toBe(false)
    expect(safeTokenEqual('', 'x')).toBe(false)
  })

  it('accepts two empty strings', () => {
    expect(safeTokenEqual('', '')).toBe(true)
  })
})

describe('hasValidVaultSession', () => {
  const token = createVaultSessionToken('hunter2')

  it('is false when no master password is configured', () => {
    master.getVaultMasterPassword.mockReturnValue(null)
    expect(hasValidVaultSession(withCookie(`${VAULT_COOKIE_NAME}=x`))).toBe(
      false
    )
  })

  it('is false when the request carries no cookie header', () => {
    expect(hasValidVaultSession(withCookie(null))).toBe(false)
  })

  it('accepts the cookie when it holds the expected token', () => {
    const req = withCookie(`${VAULT_COOKIE_NAME}=${token}`)
    expect(hasValidVaultSession(req)).toBe(true)
  })

  it('accepts it alongside unrelated cookies', () => {
    const req = withCookie(`a=1; ${VAULT_COOKIE_NAME}=${token}; b=2`)
    expect(hasValidVaultSession(req)).toBe(true)
  })

  it('rejects a forged token of the same length', () => {
    const forged = 'f'.repeat(token.length)
    expect(hasValidVaultSession(withCookie(`${VAULT_COOKIE_NAME}=${forged}`)))
      .toBe(false)
  })

  it('rejects a truncated token', () => {
    const req = withCookie(`${VAULT_COOKIE_NAME}=${token.slice(0, 10)}`)
    expect(hasValidVaultSession(req)).toBe(false)
  })

  // A cookie whose name merely ends with the vault cookie's name must not
  // be read as the vault cookie.
  it('ignores a differently named cookie holding the right value', () => {
    const req = withCookie(`other_${VAULT_COOKIE_NAME}=${token}`)
    expect(hasValidVaultSession(req)).toBe(false)
  })
})
