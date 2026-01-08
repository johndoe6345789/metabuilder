/**
 * Password strength validation result
 */
export interface PasswordStrengthResult {
  valid: boolean
  errors: string[]
  score: number // 0-100
  strength: 'weak' | 'medium' | 'strong'
}

/**
 * Validates password strength and returns detailed results
 * 
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 * 
 * @param password - Password to validate
 * @returns PasswordStrengthResult with validation details
 * 
 * @example
 * const result = validatePasswordStrength('MyPassword123!')
 * if (result.valid) {
 *   console.log(`Strength: ${result.strength}, Score: ${result.score}`)
 * } else {
 *   console.log(`Errors: ${result.errors.join(', ')}`)
 * }
 */
export function validatePasswordStrength(password: unknown): PasswordStrengthResult {
  const errors: string[] = []
  let score = 0

  // Handle null/undefined
  if (password == null || typeof password !== 'string') {
    return {
      valid: false,
      errors: ['Password is required'],
      score: 0,
      strength: 'weak'
    }
  }

  // Check minimum length (8 characters)
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters')
  } else {
    score += 20
    // Bonus for longer passwords
    score += Math.min(password.length - 8, 12) * 2
  }

  // Check for uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  } else {
    score += 15
  }

  // Check for lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  } else {
    score += 15
  }

  // Check for number
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  } else {
    score += 15
  }

  // Check for special character
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push('Password must contain at least one special character')
  } else {
    score += 15
  }

  // Additional scoring factors
  
  // Variety of character types
  const types = [
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /\d/.test(password),
    /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
  ].filter(Boolean).length
  
  score += types * 3

  // Penalize common patterns
  const commonPasswords = [
    'password', 'admin', 'welcome', 'qwerty', '123456',
    'letmein', 'monkey', 'dragon'
  ]
  
  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    score -= 20
  }

  // Penalize sequential characters (abc, 123)
  if (/abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i.test(password)) {
    score -= 10
  }
  
  if (/012|123|234|345|456|567|678|789/.test(password)) {
    score -= 10
  }

  // Penalize excessive repetition
  if (/(.)\1{2,}/.test(password)) {
    score -= 15
  }

  // Cap score at 100
  score = Math.max(0, Math.min(100, score))

  // Determine strength level
  let strength: 'weak' | 'medium' | 'strong'
  if (errors.length > 0) {
    strength = 'weak'
  } else if (score < 50) {
    strength = 'weak'
  } else if (score < 75) {
    strength = 'medium'
  } else {
    strength = 'strong'
  }

  return {
    valid: errors.length === 0,
    errors,
    score,
    strength
  }
}
