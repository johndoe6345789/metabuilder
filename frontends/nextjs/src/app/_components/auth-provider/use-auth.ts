/**
 * useAuth hook (stub)
 */

export interface AuthUser {
  id: string
  username: string
  email: string
  role: string
  level: number
}

export interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
}

export function useAuth(): AuthState {
  // TODO: Implement useAuth hook
  return {
    user: null,
    isLoading: false,
    isAuthenticated: false,
  }
}
