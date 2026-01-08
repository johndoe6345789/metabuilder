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
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

  // Test against pattern
  if (!emailRegex.test(trimmed)) {
    return false
  }

  // Additional validations
  const parts = trimmed.split('@')
  if (parts.length !== 2) {
    return false
  }
  
  const localPart = parts[0]
  const domain = parts[1]
  
  if (localPart === undefined || localPart === '' || domain === undefined || domain === '') {
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
