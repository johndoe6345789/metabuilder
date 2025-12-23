import type { User, UserRole } from './level-types'

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

export const DEFAULT_CREDENTIALS: Record<string, string> = {
  supergod: 'supergod123',
  god: 'god123',
  admin: 'admin',
  demo: 'demo',
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
