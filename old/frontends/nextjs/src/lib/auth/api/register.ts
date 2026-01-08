/**
 * Register API
 * 
 * Creates a new user account with username, email, and password
 */

import type { User } from '@/lib/types/level-types'
import { getAdapter } from '@/lib/db/core/dbal-client'
import { hashPassword } from '@/lib/db/password/hash-password'
import { getUserByUsername } from '@/lib/db/auth/queries/get-user-by-username'
import { getUserByEmail } from '@/lib/db/auth/queries/get-user-by-email'

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

export async function register(username: string, email: string, password: string): Promise<RegisterResult> {
  try {
    // Validate input
    if (username.length === 0 || email.length === 0 || password.length === 0) {
      return {
        success: false,
        user: null,
        error: 'Username, email, and password are required',
      }
    }

    // Check if username already exists
    const existingUserByUsername = await getUserByUsername(username)
    if (existingUserByUsername !== null) {
      return {
        success: false,
        user: null,
        error: 'Username already exists',
      }
    }

    // Check if email already exists
    const existingUserByEmail = await getUserByEmail(email)
    if (existingUserByEmail !== null) {
      return {
        success: false,
        user: null,
        error: 'Email already exists',
      }
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create user
    const adapter = getAdapter()
    const userId = crypto.randomUUID()
    
    await adapter.create('User', {
      id: userId,
      username,
      email,
      role: 'user', // Default role
      createdAt: BigInt(Date.now()),
      isInstanceOwner: false,
    })

    // Create credentials
    await adapter.create('Credential', {
      username,
      passwordHash,
    })

    // Fetch the created user
    const userRecord = await adapter.findFirst('User', {
      where: { id: userId },
    })

    if (userRecord === null || userRecord === undefined) {
      return {
        success: false,
        user: null,
        error: 'Failed to create user',
      }
    }

    const user: User = {
      id: userId,
      username,
      email,
      role: 'user',
      createdAt: Date.now(),
      isInstanceOwner: false,
    }

    return {
      success: true,
      user,
    }
  } catch (error) {
    return {
      success: false,
      user: null,
      error: error instanceof Error ? error.message : 'Registration failed',
    }
  }
}
