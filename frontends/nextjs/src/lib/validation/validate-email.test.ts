import { describe, it, expect } from 'vitest'
import { validateEmail } from './validate-email'

/**
 * Unit tests for email validation
 * Demonstrates TDD with parameterized tests
 */

describe('validateEmail', () => {
  it.each([
    // Valid emails
    { email: 'user@example.com', expected: true, description: 'standard email' },
    { email: 'user.name@example.com', expected: true, description: 'email with dot' },
    { email: 'user+tag@example.com', expected: true, description: 'email with plus' },
    { email: 'user_name@example.com', expected: true, description: 'email with underscore' },
    { email: 'user123@example.com', expected: true, description: 'email with numbers' },
    { email: 'user@subdomain.example.com', expected: true, description: 'email with subdomain' },
    { email: 'user@example.co.uk', expected: true, description: 'email with country TLD' },
    
    // Invalid emails
    { email: '', expected: false, description: 'empty string' },
    { email: 'not-an-email', expected: false, description: 'no @ symbol' },
    { email: '@example.com', expected: false, description: 'missing local part' },
    { email: 'user@', expected: false, description: 'missing domain' },
    { email: 'user @example.com', expected: false, description: 'space in local part' },
    { email: 'user@example .com', expected: false, description: 'space in domain' },
    { email: 'user@@example.com', expected: false, description: 'double @' },
    { email: 'user@example', expected: false, description: 'missing TLD' },
    { email: 'user.@example.com', expected: false, description: 'dot at end of local' },
    { email: '.user@example.com', expected: false, description: 'dot at start of local' },
  ])('should validate $description: "$email"', ({ email, expected }) => {
    expect(validateEmail(email)).toBe(expected)
  })

  it('should handle null and undefined', () => {
    expect(validateEmail(null as any)).toBe(false)
    expect(validateEmail(undefined as any)).toBe(false)
  })

  it('should trim whitespace before validation', () => {
    expect(validateEmail('  user@example.com  ')).toBe(true)
    expect(validateEmail('\tuser@example.com\n')).toBe(true)
  })

  it('should be case-insensitive for domain', () => {
    expect(validateEmail('user@EXAMPLE.COM')).toBe(true)
    expect(validateEmail('user@Example.Com')).toBe(true)
  })
})
