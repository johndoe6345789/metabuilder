/**
 * Authentication and Authorization Module
 * 
 * Handles user authentication, permission checking, and role-based access control.
 * Implements a 5-level hierarchical permission system where each level inherits
 * permissions from lower levels.
 */

import type { User, UserRole } from './level-types'

const SCRAMBLE_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'

function generateDeterministicScrambledPassword(seed: string, length: number = 16): string {
  // Deterministic output avoids server/client mismatches during hydration.
  let hash = 2166136261
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i)
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24)
  }

  let password = ''
  for (let i = 0; i < length; i++) {
    hash = (hash * 1664525 + 1013904223) >>> 0
    password += SCRAMBLE_CHARSET[hash % SCRAMBLE_CHARSET.length]
  }
  return password
}

// Pre-generated scrambled passwords for default user accounts
// Each role has a unique scrambled password for authentication
const SCRAMBLED_PASSWORDS = {
  supergod: generateDeterministicScrambledPassword('supergod', 16),
  god: generateDeterministicScrambledPassword('god', 16),
  admin: generateDeterministicScrambledPassword('admin', 16),
  demo: generateDeterministicScrambledPassword('demo', 16),
}

// Default users created during application initialization
// These provide initial access points for different permission levels
export const DEFAULT_USERS: User[] = [
  {
    id: 'user_supergod',
    username: 'supergod',
    email: 'supergod@builder.com',
    role: 'supergod',
    bio: 'Supreme administrator with multi-tenant control',
    createdAt: Date.now(),
    isInstanceOwner: true,
  },
  {
    id: 'user_god',
    username: 'god',
    email: 'god@builder.com',
    role: 'god',
    bio: 'System architect with full access to all levels',
    createdAt: Date.now(),
  },
  {
    id: 'user_admin',
    username: 'admin',
    email: 'admin@builder.com',
    role: 'admin',
    bio: 'Administrator with data management access',
    createdAt: Date.now(),
  },
  {
    id: 'user_demo',
    username: 'demo',
    email: 'demo@builder.com',
    role: 'user',
    bio: 'Demo user account',
    createdAt: Date.now(),
  },
]

// Maps usernames to their scrambled passwords for authentication
export const DEFAULT_CREDENTIALS: Record<string, string> = SCRAMBLED_PASSWORDS

/**
 * Gets the scrambled password for a given username
 * @param username - The username to look up
 * @returns The scrambled password, or empty string if not found
 */
export function getScrambledPassword(username: string): string {
  return SCRAMBLED_PASSWORDS[username as keyof typeof SCRAMBLED_PASSWORDS] || ''
}

export function canAccessLevel(userRole: UserRole, level: number): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    public: 1,
    user: 2,
    admin: 3,
    god: 4,
    supergod: 5,
  }
  
  return roleHierarchy[userRole] >= level
}

export function getRoleDisplayName(role: UserRole): string {
  const names: Record<UserRole, string> = {
    public: 'Public',
    user: 'User',
    admin: 'Administrator',
    god: 'System Architect',
    supergod: 'Supreme Administrator',
  }
  return names[role]
}
