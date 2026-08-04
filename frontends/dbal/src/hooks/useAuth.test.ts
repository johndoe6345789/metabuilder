import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'

vi.mock('@metabuilder/dbal-sso/core', () => ({
  beginLogin: vi.fn(),
  logout: vi.fn(),
  refreshTokens: vi.fn(),
  setAuthToken: vi.fn(),
  decodeJwtPayload: vi.fn(),
  isTokenValid: vi.fn(),
}))

vi.mock('../authConfig', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../authConfig')>()
  return {
    ...actual,
    loadPersistedSession: vi.fn(),
    savePersistedSession: vi.fn(),
  }
})

import { useAuth } from './useAuth'
import * as dbalSso from '@metabuilder/dbal-sso/core'
import * as authConfig from '../authConfig'

function makeToken(claims: Record<string, unknown>) {
  // decodeJwtPayload is mocked, so the actual token string just needs to
  // be a non-empty placeholder -- what matters is what the mock returns.
  return 'header.payload.signature-' + JSON.stringify(claims)
}

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(authConfig.loadPersistedSession as ReturnType<typeof vi.fn>).mockReturnValue(null)
  })

  it('starts unauthenticated when nothing is persisted', async () => {
    const { result } = renderHook(() => useAuth())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.authed).toBe(false)
    expect(result.current.token).toBe('')
  })

  it('auto-authenticates from a valid persisted session', async () => {
    const token = makeToken({ role: 'admin', sub: 'alice' })
    ;(authConfig.loadPersistedSession as ReturnType<typeof vi.fn>).mockReturnValue({
      token, refreshToken: 'rt-1',
    })
    ;(dbalSso.isTokenValid as ReturnType<typeof vi.fn>).mockReturnValue(true)
    ;(dbalSso.decodeJwtPayload as ReturnType<typeof vi.fn>).mockReturnValue({ role: 'admin', sub: 'alice' })

    const { result } = renderHook(() => useAuth())
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.authed).toBe(true)
    expect(result.current.token).toBe(token)
    expect(result.current.role).toBe('admin')
    expect(result.current.username).toBe('alice')
    expect(dbalSso.setAuthToken).toHaveBeenCalledWith(token)
  })

  it('refreshes an expired persisted session once', async () => {
    const expired = makeToken({ role: 'user', sub: 'bob' })
    const fresh = makeToken({ role: 'user', sub: 'bob' })
    ;(authConfig.loadPersistedSession as ReturnType<typeof vi.fn>).mockReturnValue({
      token: expired, refreshToken: 'rt-1',
    })
    ;(dbalSso.isTokenValid as ReturnType<typeof vi.fn>).mockReturnValue(false)
    ;(dbalSso.refreshTokens as ReturnType<typeof vi.fn>).mockResolvedValue({
      token: fresh, refreshToken: 'rt-2', user: { id: 'bob', username: 'bob' },
    })
    ;(dbalSso.decodeJwtPayload as ReturnType<typeof vi.fn>).mockReturnValue({ role: 'user', sub: 'bob' })

    const { result } = renderHook(() => useAuth())
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(dbalSso.refreshTokens).toHaveBeenCalledWith(expect.anything(), 'rt-1')
    expect(result.current.authed).toBe(true)
    expect(result.current.token).toBe(fresh)
  })

  it('clears session when refresh fails', async () => {
    const expired = makeToken({ role: 'user', sub: 'bob' })
    ;(authConfig.loadPersistedSession as ReturnType<typeof vi.fn>).mockReturnValue({
      token: expired, refreshToken: 'rt-1',
    })
    ;(dbalSso.isTokenValid as ReturnType<typeof vi.fn>).mockReturnValue(false)
    ;(dbalSso.refreshTokens as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('expired'))

    const { result } = renderHook(() => useAuth())
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.authed).toBe(false)
    expect(authConfig.savePersistedSession).toHaveBeenCalledWith(null)
  })

  it('handleLogin starts the OIDC redirect', async () => {
    ;(dbalSso.beginLogin as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)
    const { result } = renderHook(() => useAuth())
    await waitFor(() => expect(result.current.loading).toBe(false))
    result.current.handleLogin()
    expect(dbalSso.beginLogin).toHaveBeenCalled()
  })

  it('handleLogout revokes the server session and clears local state', async () => {
    const token = makeToken({ role: 'admin', sub: 'alice' })
    ;(authConfig.loadPersistedSession as ReturnType<typeof vi.fn>).mockReturnValue({
      token, refreshToken: 'rt-1',
    })
    ;(dbalSso.isTokenValid as ReturnType<typeof vi.fn>).mockReturnValue(true)
    ;(dbalSso.decodeJwtPayload as ReturnType<typeof vi.fn>).mockReturnValue({ role: 'admin', sub: 'alice' })

    const { result } = renderHook(() => useAuth())
    await waitFor(() => expect(result.current.authed).toBe(true))

    result.current.handleLogout()
    expect(dbalSso.logout).toHaveBeenCalledWith(expect.anything(), 'rt-1')
    await waitFor(() => expect(result.current.authed).toBe(false))
    expect(result.current.token).toBe('')
  })
})
