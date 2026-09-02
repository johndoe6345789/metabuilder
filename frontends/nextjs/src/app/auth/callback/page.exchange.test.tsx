import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'

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
    getState: vi.fn(() => ({ user: { tenantId: 'acme' } })),
  },
}))
vi.mock('@/hooks/auth/auth-store', () => authStore)

import AuthCallbackPage from './page'

function searchParamsWith(values: Record<string, string>) {
  return { get: (key: string) => values[key] ?? null }
}

// Split out of page.test.tsx (which covers the missing-params branch) to
// stay under the 80-line file limit.
describe('AuthCallbackPage completing the exchange', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exchanges the code and state, applies the session, redirects', async () => {
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

    render(<AuthCallbackPage />)

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith('/acme/panel')
    })
    expect(dbalSso.completeLogin).toHaveBeenCalledWith(
      expect.anything(),
      'my-code',
      'my-state'
    )
    expect(authStore.authStore.applySession).toHaveBeenCalledWith(
      'tok',
      'refresh'
    )
  })

  it('shows the friendly error when completeLogin rejects', async () => {
    nav.useSearchParams.mockReturnValue(
      searchParamsWith({ code: 'my-code', state: 'my-state' })
    )
    nav.useRouter.mockReturnValue({ replace: vi.fn() })
    const failure = new Error('bad exchange')
    dbalSso.completeLogin.mockRejectedValue(failure)
    dbalSso.friendlySignInError.mockReturnValue('Sign-in failed, try again.')

    render(<AuthCallbackPage />)

    await waitFor(() => {
      expect(screen.getByText('Sign-in failed, try again.')).toBeTruthy()
    })
    expect(dbalSso.friendlySignInError).toHaveBeenCalledWith(failure)
    expect(authStore.authStore.applySession).not.toHaveBeenCalled()
  })
})
