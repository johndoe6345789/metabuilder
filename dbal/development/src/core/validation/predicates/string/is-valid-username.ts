// Username validation: alphanumeric, underscore, hyphen only (3-50 chars)
export function isValidUsername(username: string): boolean {
  if (!username || username.length < 3 || username.length > 50) {
    return false
  }
  const usernamePattern = /^[a-zA-Z0-9_-]+$/
  return usernamePattern.test(username)
}
