/**
 * Hook for resolved user state
 * 
 * Provides user information from the auth system with level-based permissions.
 * Use this hook when you need to check user permissions or identity.
 */

import { useAuth } from './use-auth'

export interface ResolvedUserState {
  userId?: string
  username?: string
  email?: string
  role?: string
  level: number
  tenantId?: string
  isAuthenticated: boolean
  isLoading: boolean
  error?: string
}

/**
 * Hook for managing resolved user state
 * Returns user data from session with computed permission level.
 */
export function useResolvedUser(): ResolvedUserState {
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return {
      level: 0,
      isAuthenticated: false,
      isLoading: true,
    }
  }

  if (user === null || !isAuthenticated) {
    return {
      level: 0,
      isAuthenticated: false,
      isLoading: false,
    }
  }

  return {
    userId: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    level: user.level ?? 0,
    tenantId: user.tenantId,
    isAuthenticated: true,
    isLoading: false,
  }
}
