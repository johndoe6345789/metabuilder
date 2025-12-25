import type { User } from '../types/level-types'

/**
 * Default users created during application initialization
 */
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
