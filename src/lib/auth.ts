import type { User, UserRole } from './level-types'
import { generateScrambledPassword } from './password-utils'

const SCRAMBLED_PASSWORDS = {
  supergod: generateScrambledPassword(16),
  god: generateScrambledPassword(16),
  admin: generateScrambledPassword(16),
  demo: generateScrambledPassword(16),
}

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

export const DEFAULT_CREDENTIALS: Record<string, string> = SCRAMBLED_PASSWORDS

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
