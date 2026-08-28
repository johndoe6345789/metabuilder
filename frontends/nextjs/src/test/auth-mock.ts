/**
 * Mocking the auth context for a component test.
 *
 * useAuthContext throws outside a provider, and the provider derives its
 * value from the network, so component tests replace the module instead.
 * vi.mock is hoisted above imports, so the current value has to live in a
 * vi.hoisted box the factory can close over.
 *
 * Usage:
 *
 *   const auth = mockAuthModule()
 *   beforeEach(() => auth.set(asGod()))
 */

import { vi } from 'vitest'

import { authValue } from './auth-harness'
import type { AuthUser } from '@/hooks/auth/auth-types'

const AUTH_MODULE = '@/app/_components/auth-provider/auth-provider-component'

export function mockAuthModule() {
  const box = vi.hoisted(() => ({ value: null as unknown }))

  vi.mock(AUTH_MODULE, () => ({
    useAuthContext: () => box.value,
    AuthProvider: ({ children }: { children: unknown }) => children,
  }))

  return {
    /** null means a signed-out visitor. */
    set(user: AuthUser | null) {
      box.value = authValue(user)
    },
  }
}
