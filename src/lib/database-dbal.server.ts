/**
 * Server-side DBAL integration for Database operations
 * This file is only imported on the server side to avoid bundling Node.js modules in the client
 */

import 'server-only'

import { DBALClient } from '@/dbal/ts/src'
import type { DBALConfig } from '@/dbal/ts/src'
import type { User } from './level-types'

let dbalClient: DBALClient | null = null
let initialized = false

/**
 * Initialize DBAL client for database operations
 */
export async function initializeDBAL(): Promise<void> {
  if (initialized) {
    return
  }

  try {
    const config: DBALConfig = {
      mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
      adapter: 'prisma',
      database: {
        url: process.env.DATABASE_URL || 'file:./prisma/dev.db',
      },
      security: {
        sandbox: 'permissive',
        enableAuditLog: false,
      },
    }

    dbalClient = new DBALClient(config)
    initialized = true
    console.log('DBAL client initialized successfully')
  } catch (error) {
    console.error('Failed to initialize DBAL client:', error)
    dbalClient = null
    initialized = true
  }
}

/**
 * Get DBAL client instance (lazy initialization)
 */
export async function getDBAL(): Promise<DBALClient | null> {
  if (!initialized) {
    await initializeDBAL()
  }
  return dbalClient
}

/**
 * DBAL-powered user operations
 */
export async function dbalGetUsers(): Promise<User[]> {
  const dbal = await getDBAL()
  if (!dbal) {
    throw new Error('DBAL not available')
  }

  const result = await dbal.users.list()
  // Map DBAL User type to app User type
  return result.data.map((u: any) => ({
    id: u.id,
    username: u.username,
    email: u.email,
    role: u.role,
    profilePicture: u.profilePicture,
    bio: u.bio,
    createdAt: u.createdAt instanceof Date ? u.createdAt.getTime() : Number(u.createdAt),
    tenantId: u.tenantId,
    isInstanceOwner: u.isInstanceOwner,
  }))
}

export async function dbalAddUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
  const dbal = await getDBAL()
  if (!dbal) {
    throw new Error('DBAL not available')
  }

  // Map app role types to DBAL role types
  // Note: DBAL User type only has basic fields (id, username, email, role, createdAt, updatedAt)
  // Extended fields like profilePicture, bio, etc. are not in DBAL User type
  const dbalRole = user.role as 'user' | 'admin' | 'god' | 'supergod'
  
  const created = await dbal.users.create({
    username: user.username,
    email: user.email,
    role: dbalRole,
  })
  
  // Map DBAL User to app User, preserving extra fields
  return {
    id: created.id,
    username: created.username,
    email: created.email,
    role: created.role as any,
    profilePicture: user.profilePicture,
    bio: user.bio,
    createdAt: created.createdAt instanceof Date ? created.createdAt.getTime() : Number(created.createdAt),
    tenantId: user.tenantId,
    isInstanceOwner: user.isInstanceOwner,
  }
}

export async function dbalUpdateUser(userId: string, updates: Partial<User>): Promise<User> {
  const dbal = await getDBAL()
  if (!dbal) {
    throw new Error('DBAL not available')
  }

  // Map app updates to DBAL updates (only common fields)
  const dbalUpdates: any = {}
  if (updates.username) dbalUpdates.username = updates.username
  if (updates.email) dbalUpdates.email = updates.email
  if (updates.role) dbalUpdates.role = updates.role
  
  const updated = await dbal.users.update(userId, dbalUpdates)
  
  // Map DBAL User to app User, preserving extended fields from original updates
  return {
    id: updated.id,
    username: updated.username,
    email: updated.email,
    role: updated.role as any,
    profilePicture: updates.profilePicture,
    bio: updates.bio,
    createdAt: updated.createdAt instanceof Date ? updated.createdAt.getTime() : Number(updated.createdAt),
    tenantId: updates.tenantId,
    isInstanceOwner: updates.isInstanceOwner,
  }
}

export async function dbalDeleteUser(userId: string): Promise<boolean> {
  const dbal = await getDBAL()
  if (!dbal) {
    throw new Error('DBAL not available')
  }

  return await dbal.users.delete(userId)
}
