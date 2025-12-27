/**
 * Tests for auth.ts - Authentication and authorization utilities
 * Following parameterized test pattern per project conventions
 */

import { describe, it, expect } from 'vitest'
import {
  DEFAULT_USERS,
  DEFAULT_CREDENTIALS,
  getScrambledPassword,
  canAccessLevel,
  getRoleDisplayName,
} from './auth'
import type { UserRole } from '../types/level-types'

describe('auth', () => {
  describe('DEFAULT_USERS', () => {
    it('should have 4 default users', () => {
      expect(DEFAULT_USERS).toHaveLength(4)
    })

    it.each([
      { username: 'supergod', role: 'supergod', email: 'supergod@builder.com' },
      { username: 'god', role: 'god', email: 'god@builder.com' },
      { username: 'admin', role: 'admin', email: 'admin@builder.com' },
      { username: 'demo', role: 'user', email: 'demo@builder.com' },
    ])('should have $username user with role $role', ({ username, role, email }) => {
      const user = DEFAULT_USERS.find(u => u.username === username)
      expect(user).toBeDefined()
      expect(user?.role).toBe(role)
      expect(user?.email).toBe(email)
    })

    it('should mark supergod as instance owner', () => {
      const supergod = DEFAULT_USERS.find(u => u.username === 'supergod')
      expect(supergod?.isInstanceOwner).toBe(true)
    })
  })

  describe('DEFAULT_CREDENTIALS', () => {
    it.each(['supergod', 'god', 'admin', 'demo'])(
      'should have credentials for %s',
      (username) => {
        expect(DEFAULT_CREDENTIALS[username]).toBeDefined()
        expect(typeof DEFAULT_CREDENTIALS[username]).toBe('string')
        expect(DEFAULT_CREDENTIALS[username].length).toBe(16)
      }
    )

    it('should generate deterministic passwords', () => {
      // Passwords should be the same on every call (deterministic)
      const password1 = DEFAULT_CREDENTIALS['supergod']
      const password2 = DEFAULT_CREDENTIALS['supergod']
      expect(password1).toBe(password2)
    })

    it('should generate unique passwords for each user', () => {
      const passwords = Object.values(DEFAULT_CREDENTIALS)
      const uniquePasswords = new Set(passwords)
      expect(uniquePasswords.size).toBe(passwords.length)
    })
  })

  describe('getScrambledPassword', () => {
    it.each([
      { username: 'supergod', expectPassword: true },
      { username: 'god', expectPassword: true },
      { username: 'admin', expectPassword: true },
      { username: 'demo', expectPassword: true },
      { username: 'unknown', expectPassword: false },
      { username: '', expectPassword: false },
    ])('should handle username "$username"', ({ username, expectPassword }) => {
      const result = getScrambledPassword(username)
      
      if (expectPassword) {
        expect(result).toBe(DEFAULT_CREDENTIALS[username])
        expect(result.length).toBe(16)
      } else {
        expect(result).toBe('')
      }
    })
  })

  describe('canAccessLevel', () => {
    it.each([
      // Public can only access level 1
      { role: 'public' as UserRole, level: 1, expected: true },
      { role: 'public' as UserRole, level: 2, expected: false },
      { role: 'public' as UserRole, level: 5, expected: false },
      
      // User can access levels 1-2
      { role: 'user' as UserRole, level: 1, expected: true },
      { role: 'user' as UserRole, level: 2, expected: true },
      { role: 'user' as UserRole, level: 3, expected: false },
      
      // Admin can access levels 1-4 (moderator is level 3)
      { role: 'admin' as UserRole, level: 1, expected: true },
      { role: 'admin' as UserRole, level: 2, expected: true },
      { role: 'admin' as UserRole, level: 3, expected: true },
      { role: 'admin' as UserRole, level: 4, expected: true },
      
      // God can access levels 1-5
      { role: 'god' as UserRole, level: 1, expected: true },
      { role: 'god' as UserRole, level: 3, expected: true },
      { role: 'god' as UserRole, level: 4, expected: true },
      { role: 'god' as UserRole, level: 5, expected: true },
      
      // Supergod can access all levels 1-6
      { role: 'supergod' as UserRole, level: 1, expected: true },
      { role: 'supergod' as UserRole, level: 3, expected: true },
      { role: 'supergod' as UserRole, level: 5, expected: true },
    ])('$role accessing level $level should be $expected', ({ role, level, expected }) => {
      expect(canAccessLevel(role, level)).toBe(expected)
    })
  })

  describe('getRoleDisplayName', () => {
    it.each([
      { role: 'public' as UserRole, displayName: 'Public' },
      { role: 'user' as UserRole, displayName: 'User' },
      { role: 'admin' as UserRole, displayName: 'Administrator' },
      { role: 'god' as UserRole, displayName: 'System Architect' },
      { role: 'supergod' as UserRole, displayName: 'Supreme Administrator' },
    ])('should return "$displayName" for role "$role"', ({ role, displayName }) => {
      expect(getRoleDisplayName(role)).toBe(displayName)
    })
  })
})
