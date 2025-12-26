import type { UserRole } from '@/lib/level-types'

export interface AuthUser {
  id: string
  email: string
  username?: string
  name?: string
  role?: UserRole
  level?: number
  tenantId?: string
  profilePicture?: string
  bio?: string
  isInstanceOwner?: boolean
}

export interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface UseAuthReturn extends AuthState {
  login: (identifier: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}
