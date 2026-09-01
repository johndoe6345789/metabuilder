/**
 * Validates an email address
 *
 * @param email - Email address to validate
 * @returns true if valid, false otherwise
 *
 * @example
 * validateEmail('user@example.com') // true
 * validateEmail('invalid-email') // false
 */
export function validateEmail(email: unknown): boolean {
  // Handle null/undefined
  if (email == null) {
    return false
  }

  // Ensure it's a string
  if (typeof email !== 'string') {
    return false
  }

  // Trim whitespace
  const trimmed = email.trim()

  // Check if empty
  if (trimmed.length === 0) {
    return false
  }

  // Basic email regex pattern
  // Matches: local-part@domain.tld
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

  // Test against pattern
  if (!emailRegex.test(trimmed)) {
    return false
  }

  // Additional validations
  const parts = trimmed.split('@')
  if (parts.length !== 2) {
    return false
  }

  // .at() is typed `string | undefined` under both tsconfig variants
  // (unlike destructuring from split()'s `string[]`, which strict mode
  // cannot correlate with the length===2 check above even though it
  // guarantees both exist at runtime).
  const localPart = parts.at(0) ?? ''
  const domain = parts.at(1) ?? ''

  if (localPart === '' || domain === '') {
    return false
  }

  // Local part cannot start or end with dot
  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return false
  }

  // Domain must have at least one dot (TLD)
  if (!domain.includes('.')) {
    return false
  }

  return true
}
