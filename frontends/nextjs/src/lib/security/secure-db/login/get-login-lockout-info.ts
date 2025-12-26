import { loginAttemptTracker } from './login-attempt-tracker'
import { sanitizeInput } from './sanitize-input'

export interface LoginLockoutInfo {
  locked: boolean
  lockedUntil?: number
  remainingMs?: number
}

export const getLoginLockoutInfo = (username: string): LoginLockoutInfo => {
  const sanitizedUsername = sanitizeInput(username).trim()
  const locked = loginAttemptTracker.isLocked(sanitizedUsername)
  if (!locked) {
    return { locked: false }
  }

  const state = loginAttemptTracker.getState(sanitizedUsername)
  if (!state?.lockedUntil) {
    return { locked: true }
  }

  const remainingMs = Math.max(0, state.lockedUntil - Date.now())
  return {
    locked: true,
    lockedUntil: state.lockedUntil,
    remainingMs,
  }
}
