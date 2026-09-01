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
  authStore: { applySession: vi.fn() },
}))
vi.mock('@/hooks/auth/auth-store', () => authStore)

import AuthCallbackPage from './page'

function searchParamsWith(values: Record<string, string>) {
  return { get: (key: string) => values[key] ?? null }
}

describe('AuthCallbackPage before/without a valid exchange', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows the signing-in message before the exchange settles', () => {
    nav.useSearchParams.mockReturnValue(searchParamsWith({}))
    nav.useRouter.mockReturnValue({ replace: vi.fn() })
    dbalSso.completeLogin.mockReturnValue(new Promise(() => {}))
    render(<AuthCallbackPage />)
    expect(screen.getByText('Signing in…')).toBeTruthy()
  })

  it('shows a friendly message with no completeLogin call when the ' +
    'state param is missing', async () => {
    nav.useSearchParams.mockReturnValue(searchParamsWith({ code: 'abc' }))
    nav.useRouter.mockReturnValue({ replace: vi.fn() })
    render(<AuthCallbackPage />)

    await waitFor(() => {
      expect(
        screen.getByText(/incomplete or was already used/)
      ).toBeTruthy()
    })
    expect(dbalSso.completeLogin).not.toHaveBeenCalled()
    expect(screen.getByText('Back to sign in')).toBeTruthy()
  })
})
