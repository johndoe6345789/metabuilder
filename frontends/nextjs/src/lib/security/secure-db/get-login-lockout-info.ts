import { loginAttemptTracker } from './login-attempt-tracker'

export interface LoginLockoutInfo {
  locked: boolean
  lockedUntil?: number
  remainingMs?: number
}

export const getLoginLockoutInfo = (username: string): LoginLockoutInfo => {
  const locked = loginAttemptTracker.isLocked(username)
  if (!locked) {
    return { locked: false }
  }

  const state = loginAttemptTracker.getState(username)
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
