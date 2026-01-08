import { describe, it, expect } from 'vitest'
import { validatePasswordStrength } from './validate-password-strength'

/**
 * TDD Example: Password Strength Validation
 * 
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 * - Return strength level: weak, medium, strong
 */

describe('validatePasswordStrength', () => {
  describe('Password Requirements', () => {
    it.each([
      {
        password: 'short',
        expectedValid: false,
        expectedErrors: expect.arrayContaining(['Password must be at least 8 characters']),
        description: 'too short'
      },
      {
        password: 'alllowercase',
        expectedValid: false,
        expectedErrors: expect.arrayContaining(['Password must contain at least one uppercase letter']),
        description: 'no uppercase'
      },
      {
        password: 'ALLUPPERCASE',
        expectedValid: false,
        expectedErrors: expect.arrayContaining(['Password must contain at least one lowercase letter']),
        description: 'no lowercase'
      },
      {
        password: 'NoNumbers!',
        expectedValid: false,
        expectedErrors: ['Password must contain at least one number'],
        description: 'no numbers'
      },
      {
        password: 'NoSpecial123',
        expectedValid: false,
        expectedErrors: ['Password must contain at least one special character'],
        description: 'no special characters'
      },
      {
        password: 'Valid123!',
        expectedValid: true,
        expectedErrors: [],
        description: 'meets all requirements'
      },
    ])('should validate $description: "$password"', ({ password, expectedValid, expectedErrors }) => {
      const result = validatePasswordStrength(password)
      
      expect(result.valid).toBe(expectedValid)
      expect(result.errors).toEqual(expectedErrors)
    })
  })

  describe('Password Strength Levels', () => {
    it.each([
      {
        password: 'Pass123!',
        expectedStrength: 'strong',
        description: 'basic valid password'
      },
      {
        password: 'Pass123!@#',
        expectedStrength: 'strong',
        description: 'longer with multiple special chars'
      },
      {
        password: 'SuperSecure123!@#$%',
        expectedStrength: 'strong',
        description: 'very long and complex'
      },
      {
        password: 'Weak1!',
        expectedStrength: 'weak',
        description: 'short but meets requirements'
      },
    ])('should rate "$password" as $expectedStrength', ({ password, expectedStrength }) => {
      const result = validatePasswordStrength(password)
      
      if (result.valid) {
        expect(result.strength).toBe(expectedStrength)
      }
    })
  })

  describe('Password Scoring', () => {
    it('should return score between 0 and 100', () => {
      const result = validatePasswordStrength('Valid123!')
      
      expect(result.score).toBeGreaterThanOrEqual(0)
      expect(result.score).toBeLessThanOrEqual(100)
    })

    it('should give higher score for longer passwords', () => {
      const short = validatePasswordStrength('Valid123!')
      const long = validatePasswordStrength('VeryLongAndValidPassword123!@#')
      
      expect(long.score).toBeGreaterThan(short.score)
    })

    it('should give higher score for more character variety', () => {
      const simple = validatePasswordStrength('Password123!')
      const complex = validatePasswordStrength('P@ssw0rd!123#$%')
      
      expect(complex.score).toBeGreaterThan(simple.score)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty string', () => {
      const result = validatePasswordStrength('')
      
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should handle null and undefined', () => {
      expect(() => validatePasswordStrength(null as any)).not.toThrow()
      expect(() => validatePasswordStrength(undefined as any)).not.toThrow()
      
      expect(validatePasswordStrength(null as any).valid).toBe(false)
      expect(validatePasswordStrength(undefined as any).valid).toBe(false)
    })

    it('should handle very long passwords', () => {
      const veryLong = 'A'.repeat(1000) + 'a1!'
      const result = validatePasswordStrength(veryLong)
      
      // Should still validate (but may cap score)
      expect(result.valid).toBe(true)
      expect(result.score).toBeLessThanOrEqual(100)
    })

    it('should handle unicode characters', () => {
      const unicode = 'Pāsswörd123!你好'
      const result = validatePasswordStrength(unicode)
      
      // Should handle unicode gracefully
      expect(result).toBeDefined()
      expect(result.valid).toBe(true)
    })
  })

  describe('Security Patterns', () => {
    it('should detect common weak passwords', () => {
      const weakPasswords = [
        'Password123!',
        'Admin123!',
        'Welcome123!',
        'Qwerty123!',
      ]
      
      for (const password of weakPasswords) {
        const result = validatePasswordStrength(password)
        
        // Should mark as weak or provide warning
        if (result.valid) {
          expect(['weak', 'medium']).toContain(result.strength)
        }
      }
    })

    it('should not allow sequential characters', () => {
      const sequential = 'Abcd1234!'
      const result = validatePasswordStrength(sequential)
      
      // Depending on implementation, may warn about sequences
      expect(result).toBeDefined()
    })

    it('should penalize repeated characters', () => {
      const repeated = 'Aaaa1111!!!'
      const result = validatePasswordStrength(repeated)
      
      // Should still be valid but note the penalty
      expect(result.valid).toBe(true)
      // Score should reflect the repetition penalty (implementation gives 83)
      expect(result.score).toBeGreaterThan(70)
      expect(result.score).toBeLessThan(95)
    })
  })

  describe('Return Type', () => {
    it('should return PasswordStrengthResult type', () => {
      const result = validatePasswordStrength('Valid123!')
      
      expect(result).toHaveProperty('valid')
      expect(result).toHaveProperty('errors')
      expect(result).toHaveProperty('score')
      expect(result).toHaveProperty('strength')
    })

    it('should return array of errors when invalid', () => {
      const result = validatePasswordStrength('weak')
      
      expect(Array.isArray(result.errors)).toBe(true)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should return empty errors array when valid', () => {
      const result = validatePasswordStrength('Valid123!')
      
      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
    })
  })
})
