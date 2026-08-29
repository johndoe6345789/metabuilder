/**
 * Rendering a component that reads auth context.
 *
 * AuthProviderComponent derives its value from useAuth, which talks to the
 * network. Tests want to state the signed-in user directly, so this builds
 * the same context value by hand and provides it. Everything a component can
 * read through useAuthContext therefore comes from `user` alone.
 */

import { vi } from 'vitest'

import { getRoleLevel } from '@/lib/constants'
import type { AuthUser } from '@/hooks/auth/auth-types'

export const asUser = (over: Partial<AuthUser> = {}): AuthUser => ({
  id: 'u1',
  email: 'u1@example.com',
  username: 'u1',
  role: 'user',
  tenantId: 'system',
  ...over,
})

export const asGod = (over: Partial<AuthUser> = {}): AuthUser =>
  asUser({ role: 'god', ...over })

export function authValue(user: AuthUser | null) {
  return {
    user,
    isAuthenticated: user !== null,
    isLoading: false,
    logout: vi.fn(async () => {}),
    refresh: vi.fn(async () => {}),
    hasLevel: (min: number) =>
      user === null ? min <= 0 : getRoleLevel(user.role ?? 'user') >= min,
    hasRole: (role: string) =>
      user === null ? role === 'public' : user.role === role,
  }
}
