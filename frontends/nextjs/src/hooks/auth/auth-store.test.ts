import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const sso = vi.hoisted(() => ({
  refreshTokens: vi.fn(),
  logout: vi.fn(async () => {}),
  setAuthToken: vi.fn(),
  isTokenValid: vi.fn(() => true),
}))

const persist = vi.hoisted(() => ({
  loadPersistedSession: vi.fn(),
  savePersistedSession: vi.fn(),
  dbalSsoConfig: {},
}))

vi.mock('@metabuilder/dbal-sso/core', () => sso)
vi.mock('@/lib/dbalSsoConfig', () => persist)

import { AuthStore } from './auth-store'

const profile = { id: 'u1', email: 'u@e.com', role: 'user' }

function mockFetch(userBody: unknown = { user: profile }) {
  const calls: { url: string; method: string }[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      calls.push({ url: String(url), method: init?.method ?? 'GET' })
      return { ok: true, json: async () => userBody } as Response
    })
  )
  return calls
}

describe('AuthStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sso.isTokenValid.mockReturnValue(true)
    persist.loadPersistedSession.mockReturnValue(null)
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('initial state', () => {
    it('starts signed out', () => {
      expect(new AuthStore().getState()).toEqual({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
    })
  })

  describe('subscribe', () => {
    it('notifies on a state change', async () => {
      mockFetch()
      const store = new AuthStore()
      const listener = vi.fn()
      store.subscribe(listener)

      await store.refresh()

      expect(listener).toHaveBeenCalled()
    })

    it('stops notifying once unsubscribed', async () => {
      mockFetch()
      const store = new AuthStore()
      const listener = vi.fn()
      store.subscribe(listener)()

      await store.refresh()

      expect(listener).not.toHaveBeenCalled()
    })
  })

  describe('refresh with no persisted session', () => {
    it('settles signed out rather than loading forever', async () => {
      const store = new AuthStore()

      await store.refresh()

      expect(store.getState()).toEqual({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
    })

    it('does not ask the network', async () => {
      const calls = mockFetch()
      await new AuthStore().refresh()
      expect(calls).toHaveLength(0)
    })
  })

  describe('refresh with a valid token', () => {
    beforeEach(() => {
      persist.loadPersistedSession.mockReturnValue({
        token: 't',
        refreshToken: 'r',
      })
    })

    it('signs the user in', async () => {
      mockFetch()
      const store = new AuthStore()

      await store.refresh()

      expect(store.getState().isAuthenticated).toBe(true)
      expect(store.getState().user?.id).toBe('u1')
      expect(store.getState().isLoading).toBe(false)
    })

    it('mirrors the token into the session cookie', async () => {
      // The DBAL write proxy only sees the cookie, not the in-memory token.
      const calls = mockFetch()
      await new AuthStore().refresh()

      expect(calls.some(c => c.method === 'POST')).toBe(true)
    })

    it('does not attempt a token refresh', async () => {
      mockFetch()
      await new AuthStore().refresh()
      expect(sso.refreshTokens).not.toHaveBeenCalled()
    })
  })

  describe('refresh with an expired token', () => {
    beforeEach(() => {
      sso.isTokenValid.mockReturnValue(false)
    })

    it('exchanges the refresh token and persists the new pair', async () => {
      persist.loadPersistedSession.mockReturnValue({
        token: 'old',
        refreshToken: 'r',
      })
      sso.refreshTokens.mockResolvedValue({ token: 'new', refreshToken: 'r2' })
      mockFetch()

      const store = new AuthStore()
      await store.refresh()

      expect(persist.savePersistedSession).toHaveBeenCalledWith({
        token: 'new',
        refreshToken: 'r2',
      })
      expect(store.getState().isAuthenticated).toBe(true)
    })

    it('signs out when there is nothing to refresh with', async () => {
      persist.loadPersistedSession.mockReturnValue({
        token: 'old',
        refreshToken: null,
      })
      mockFetch()

      const store = new AuthStore()
      await store.refresh()

      expect(store.getState().isAuthenticated).toBe(false)
      expect(persist.savePersistedSession).toHaveBeenCalledWith(null)
    })

    it('signs out when the exchange fails', async () => {
      persist.loadPersistedSession.mockReturnValue({
        token: 'old',
        refreshToken: 'r',
      })
      sso.refreshTokens.mockRejectedValue(new Error('refresh rejected'))
      mockFetch()

      const store = new AuthStore()
      await store.refresh()

      expect(store.getState().user).toBeNull()
      expect(sso.setAuthToken).toHaveBeenCalledWith(null)
    })
  })

  describe('refresh when the profile is rejected', () => {
    it('clears the session rather than staying half signed in', async () => {
      persist.loadPersistedSession.mockReturnValue({
        token: 't',
        refreshToken: 'r',
      })
      mockFetch({ user: null })

      const store = new AuthStore()
      await store.refresh()

      expect(store.getState()).toEqual({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
      expect(persist.savePersistedSession).toHaveBeenCalledWith(null)
    })
  })

  describe('ensureSessionChecked', () => {
    it('does not start a second check while one is in flight', async () => {
      persist.loadPersistedSession.mockReturnValue({
        token: 't',
        refreshToken: 'r',
      })
      mockFetch()
      const store = new AuthStore()

      await Promise.all([
        store.ensureSessionChecked(),
        store.ensureSessionChecked(),
      ])

      expect(persist.loadPersistedSession).toHaveBeenCalledTimes(1)
    })

    it('can be called again after the first check settles', async () => {
      mockFetch()
      const store = new AuthStore()

      await store.ensureSessionChecked()
      await store.ensureSessionChecked()

      expect(persist.loadPersistedSession).toHaveBeenCalledTimes(2)
    })
  })

  describe('logout', () => {
    it('clears the session', async () => {
      mockFetch()
      const store = new AuthStore()

      await store.logout()

      expect(store.getState().isAuthenticated).toBe(false)
      expect(sso.setAuthToken).toHaveBeenCalledWith(null)
      expect(persist.savePersistedSession).toHaveBeenCalledWith(null)
    })

    it('clears local state even when the provider call fails', async () => {
      // Otherwise a provider outage would leave the user apparently signed in.
      sso.logout.mockRejectedValueOnce(new Error('provider down'))
      mockFetch()
      const store = new AuthStore()

      await expect(store.logout()).rejects.toThrow('provider down')
      expect(store.getState().user).toBeNull()
    })

    it('deletes the session cookie', async () => {
      const calls = mockFetch()
      await new AuthStore().logout()
      expect(calls.some(c => c.method === 'DELETE')).toBe(true)
    })
  })

  describe('applySession', () => {
    it('persists the pair and loads the profile', async () => {
      mockFetch()
      const store = new AuthStore()

      await store.applySession('t', 'r')

      expect(persist.savePersistedSession).toHaveBeenCalledWith({
        token: 't',
        refreshToken: 'r',
      })
      expect(store.getState().isAuthenticated).toBe(true)
    })

    it('rethrows and clears when the profile is rejected', async () => {
      mockFetch({ user: null })
      const store = new AuthStore()

      await expect(store.applySession('t', 'r')).rejects.toThrow()
      expect(store.getState().isAuthenticated).toBe(false)
      expect(persist.savePersistedSession).toHaveBeenLastCalledWith(null)
    })
  })
})
