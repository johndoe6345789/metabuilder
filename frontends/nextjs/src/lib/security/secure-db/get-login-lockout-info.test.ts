import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { loginAttemptTracker, DEFAULT_AUTH_LOCKOUT_MAX_ATTEMPTS } from './login-attempt-tracker'
import { getLoginLockoutInfo } from './get-login-lockout-info'

describe('getLoginLockoutInfo', () => {
  beforeEach(() => {
    loginAttemptTracker.reset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns unlocked when no lockout state exists', () => {
    const info = getLoginLockoutInfo('user')
    expect(info.locked).toBe(false)
  })

  it('returns remaining time while locked and clears after expiry', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(0))

    for (let i = 0; i < DEFAULT_AUTH_LOCKOUT_MAX_ATTEMPTS; i += 1) {
      loginAttemptTracker.registerFailure('user')
    }

    const info = getLoginLockoutInfo('user')
    expect(info.locked).toBe(true)
    expect(info.remainingMs).toBeGreaterThan(0)

    const remainingMs = info.remainingMs ?? 0
    vi.advanceTimersByTime(remainingMs + 1)

    const cleared = getLoginLockoutInfo('user')
    expect(cleared.locked).toBe(false)
  })
})
