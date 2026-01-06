/**
 * Register API (stub)
 */

import type { User } from '@/lib/types/level-types'

export interface RegisterData {
  username: string
  email: string
  password: string
}

export function register(_username: string, _email: string, _password: string): Promise<User> {
  // TODO: Implement registration
  return Promise.reject(new Error('Registration not implemented'))
}
