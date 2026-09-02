import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, waitFor } from '@testing-library/react'

const nav = vi.hoisted(() => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}))
vi.mock('next/navigation', () => nav)

const dbalSso = vi.hoisted(() => ({
  completeLogin: vi.fn(),
  friendlySignInError: vi.fn(),
}))
vi.mock('@metabuilder/dbal-sso/core', () => dbalSso)

const authStore = vi.hoisted(() => ({
  authStore: {
    applySession: vi.fn(),
    getState: vi.fn(() => ({ user: null as { tenantId?: string } | null })),
  },
}))
vi.mock('@/hooks/auth/auth-store', () => authStore)

import AuthCallbackPage from './page'

function searchParamsWith(values: Record<string, string>) {
  return { get: (key: string) => values[key] ?? null }
}

// Split out of page.exchange.test.tsx to stay under the 80-line file limit.
describe('AuthCallbackPage redirect target', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('falls back to the default tenant panel with no tenantId', async () => {
    nav.useSearchParams.mockReturnValue(
      searchParamsWith({ code: 'my-code', state: 'my-state' })
    )
    const replace = vi.fn()
    nav.useRouter.mockReturnValue({ replace })
    dbalSso.completeLogin.mockResolvedValue({
      token: 'tok',
      refreshToken: 'refresh',
    })
    authStore.authStore.applySession.mockResolvedValue(undefined)
    authStore.authStore.getState.mockReturnValue({ user: null })

    render(<AuthCallbackPage />)

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith('/system/panel')
    })
  })
})
