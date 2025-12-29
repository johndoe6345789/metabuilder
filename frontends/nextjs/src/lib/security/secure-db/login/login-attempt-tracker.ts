interface LoginAttemptState {
  count: number
  firstAttemptAt: number
  lockedUntil?: number
}

const DEFAULT_AUTH_LOCKOUT_WINDOW_MS = 15 * 60 * 1000
const DEFAULT_AUTH_LOCKOUT_MAX_ATTEMPTS = 5
const DEFAULT_AUTH_LOCKOUT_MS = 5 * 60 * 1000

const parsePositiveInt = (value: string | undefined, fallback: number): number => {
  if (!value) return fallback
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback
  return parsed
}

const lockoutConfig = {
  windowMs: parsePositiveInt(process.env.MB_AUTH_LOCKOUT_WINDOW_MS, DEFAULT_AUTH_LOCKOUT_WINDOW_MS),
  maxAttempts: parsePositiveInt(
    process.env.MB_AUTH_LOCKOUT_MAX_ATTEMPTS,
    DEFAULT_AUTH_LOCKOUT_MAX_ATTEMPTS
  ),
  lockoutMs: parsePositiveInt(process.env.MB_AUTH_LOCKOUT_MS, DEFAULT_AUTH_LOCKOUT_MS),
}

export class LoginAttemptTracker {
  private attempts = new Map<string, LoginAttemptState>()

  isLocked(username: string): boolean {
    const attempt = this.attempts.get(username)
    if (!attempt?.lockedUntil) return false

    if (attempt.lockedUntil <= Date.now()) {
      this.attempts.delete(username)
      return false
    }

    return true
  }

  registerFailure(username: string): { locked: boolean; lockedUntil?: number } {
    const now = Date.now()
    const existing = this.attempts.get(username)

    if (existing?.lockedUntil && existing.lockedUntil > now) {
      return { locked: true, lockedUntil: existing.lockedUntil }
    }

    if (existing?.lockedUntil && existing.lockedUntil <= now) {
      this.attempts.delete(username)
    }

    const state = this.attempts.get(username)
    const withinWindow = state && now - state.firstAttemptAt <= lockoutConfig.windowMs
    const nextState: LoginAttemptState = withinWindow
      ? { ...state, count: state.count + 1 }
      : { count: 1, firstAttemptAt: now }

    if (nextState.count >= lockoutConfig.maxAttempts) {
      nextState.lockedUntil = now + lockoutConfig.lockoutMs
    }

    this.attempts.set(username, nextState)

    return {
      locked: Boolean(nextState.lockedUntil),
      lockedUntil: nextState.lockedUntil,
    }
  }

  registerSuccess(username: string): void {
    this.attempts.delete(username)
  }

  getState(username: string): LoginAttemptState | null {
    return this.attempts.get(username) ?? null
  }

  reset(): void {
    this.attempts.clear()
  }
}

export const loginAttemptTracker = new LoginAttemptTracker()

export {
  DEFAULT_AUTH_LOCKOUT_MAX_ATTEMPTS,
  DEFAULT_AUTH_LOCKOUT_MS,
  DEFAULT_AUTH_LOCKOUT_WINDOW_MS,
}
