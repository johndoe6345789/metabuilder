// Username validation: alphanumeric, underscore, hyphen only (1-50 chars)
// TODO: add tests for isValidUsername (length, allowed chars).
export function isValidUsername(username: string): boolean {
  if (!username || username.length === 0 || username.length > 50) {
    return false
  }
  const usernamePattern = /^[a-zA-Z0-9_-]+$/
  return usernamePattern.test(username)
}
