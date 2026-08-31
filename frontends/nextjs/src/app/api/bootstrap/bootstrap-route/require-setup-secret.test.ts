import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { hasValidSetupSecret } from './require-setup-secret'

beforeEach(() => {
  vi.stubEnv('SETUP_SECRET', 'topsecret')
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('hasValidSetupSecret', () => {
  it('accepts the configured secret as a Bearer header', () => {
    expect(hasValidSetupSecret('Bearer topsecret')).toBe(true)
  })

  it('rejects the wrong secret', () => {
    expect(hasValidSetupSecret('Bearer wrong')).toBe(false)
  })

  it('rejects a missing header', () => {
    expect(hasValidSetupSecret(null)).toBe(false)
  })

  it('rejects the bare secret with no Bearer scheme', () => {
    expect(hasValidSetupSecret('topsecret')).toBe(false)
  })

  it('rejects everything when SETUP_SECRET is unset', () => {
    vi.stubEnv('SETUP_SECRET', '')
    expect(hasValidSetupSecret('Bearer ')).toBe(false)
  })
})
