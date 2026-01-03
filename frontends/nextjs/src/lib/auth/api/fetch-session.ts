/**
 * @file fetch-session.ts
 * @description Fetch current user session
 */

import type { User } from '@/lib/level-types'

export async function fetchSession(): Promise<User | null> {
  try {
    const response = await fetch('/api/auth/session', {
      credentials: 'include',
    })

    if (!response.ok) {
      if (response.status === 401) {
        return null
      }
      throw new Error('Failed to fetch session')
    }

    const data = await response.json()
    return data.user || null
  } catch (error) {
    console.error('Error fetching session:', error)
    return null
  }
}
