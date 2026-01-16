/**
 * Login API
 * 
 * Authenticates a user and returns user data on success
 * 
 * TODO: Migrate authenticate logic to DBAL auth operations
 */

import type { User } from '@/lib/types/level-types'
// TODO: Replace with DBAL auth operations
import { authenticateUser } from '@/lib/db-old-to-delete/auth/queries/authenticate-user'

export interface LoginCredentials {
  username: string
  password: string
}

export interface LoginResult {
  success: boolean
  user: User | null
  error?: string
  requiresPasswordChange?: boolean
}

export async function login(identifier: string, password: string): Promise<LoginResult> {
  try {
    const result = await authenticateUser(identifier, password)
    
    if (!result.success) {
      return {
        success: false,
        user: null,
        error: result.error === 'invalid_credentials' 
          ? 'Invalid username or password'
          : result.error === 'user_not_found'
          ? 'User not found'
          : result.error === 'account_locked'
          ? 'Account is locked'
          : 'Authentication failed',
      }
    }
    
    return {
      success: true,
      user: result.user,
      requiresPasswordChange: result.requiresPasswordChange,
    }
  } catch (error) {
    return {
      success: false,
      user: null,
      error: error instanceof Error ? error.message : 'Login failed',
    }
  }
}
