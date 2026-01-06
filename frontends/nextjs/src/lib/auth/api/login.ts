/**
 * Login API (stub)
 */

import type { User } from '@/lib/types/level-types'

export interface LoginCredentials {
  username: string
  password: string
}

export async function login(_identifier: string, _password: string): Promise<User> {
  // TODO: Implement login
  // For now, throw an error to indicate not implemented
  throw new Error('Login not implemented')
}
