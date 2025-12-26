import type { User } from '@/lib/level-types'

export async function fetchSession(): Promise<User | null> {
  try {
    const response = await fetch('/api/auth/session', { cache: 'no-store' })
    if (!response.ok) return null
    const payload = (await response.json()) as { user?: User | null } | null
    return payload?.user ?? null
  } catch (error) {
    console.error('Failed to fetch session:', error)
    return null
  }
}
