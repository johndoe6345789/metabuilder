/**
 * @file register.ts
 * @description User registration API
 */

import type { User } from '@/lib/level-types'

export async function register(username: string, email: string, password: string): Promise<User> {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ username, email, password }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Registration failed' }))
    throw new Error(error.message || 'Registration failed')
  }

  const data = await response.json()
  return data.user
}
