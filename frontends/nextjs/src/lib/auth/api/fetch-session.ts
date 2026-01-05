/**
 * Fetch current session (stub)
 */

export interface Session {
  id: string
  userId: string
  token: string
  expiresAt: number
}

export async function fetchSession(): Promise<Session | null> {
  // TODO: Implement session fetching
  return null
}
