/**
 * Register API
 * 
 * Creates a new user account with username, email, and password
 */

import type { User } from '@/lib/types/level-types'
import type { DbalUserRecord } from '@/lib/auth/types'
import { db } from '@/lib/db-client'
import crypto from 'crypto'

export interface RegisterData {
  username: string
  email: string
  password: string
}

export interface RegisterResult {
  success: boolean
  user: User | null
  error?: string
}

/**
 * Hash password using SHA-512
 */
async function hashPassword(password: string): Promise<string> {
  return crypto.createHash('sha512').update(password).digest('hex')
}

export async function register(username: string, email: string, password: string): Promise<RegisterResult> {
  try {
    // Validate input
    if (!username || !email || !password) {
      return {
        success: false,
        user: null,
        error: 'Username, email, and password are required',
      }
    }

    // Check if username already exists
    const existingByUsername = await db.users.list({
      filter: { username }
    })
    
    if (existingByUsername.data && existingByUsername.data.length > 0) {
      return {
        success: false,
        user: null,
        error: 'Username already exists',
      }
    }

    // Check if email already exists
    const existingByEmail = await db.users.list({
      filter: { email }
    })
    
    if (existingByEmail.data && existingByEmail.data.length > 0) {
      return {
        success: false,
        user: null,
        error: 'Email already exists',
      }
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create user
    const userId = crypto.randomUUID()
    
    const newUser = await db.users.create({
      id: userId,
      username,
      email,
      role: 'user',
      createdAt: BigInt(Date.now()),
      isInstanceOwner: false,
      tenantId: null,
      profilePicture: null,
      bio: null,
    }) as unknown as DbalUserRecord

    // Create credentials
    await db.credentials.create({
      id: `cred_${userId}`,
      username,
      passwordHash,
      userId,
    })

    const user: User = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      createdAt: Number(newUser.createdAt),
      isInstanceOwner: newUser.isInstanceOwner || false,
      tenantId: newUser.tenantId || null,
      profilePicture: newUser.profilePicture || null,
      bio: newUser.bio || null,
    }

    return {
      success: true,
      user,
    }
  } catch (error) {
    console.error('Registration error:', error)
    return {
      success: false,
      user: null,
      error: error instanceof Error ? error.message : 'Registration failed',
    }
  }
}
