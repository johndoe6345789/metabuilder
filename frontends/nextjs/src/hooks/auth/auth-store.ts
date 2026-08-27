/**
 * @file auth-store.ts
 * @description Authentication state management store
 *
 * Backed by DBAL's own OIDC flow (@metabuilder/dbal-sso/core) -- the store
 * holds the access/refresh token pair in sessionStorage and asks
 * /api/auth/session (a thin server-side proxy to DBAL's /oidc/userinfo +
 * User entity) for the full profile, rather than owning a password check or
 * server-side session table itself.
 */

import {
  refreshTokens,
  logout as oidcLogout,
  setAuthToken,
  isTokenValid,
} from '@metabuilder/dbal-sso/core'
import type { User } from '@/lib/types/level-types'
import type { AuthState } from './auth-types'
import { mapUserToAuthUser } from './utils/map-user'
import { BASE_PATH } from '@/lib/app-config'
import { dbalSsoConfig, loadPersistedSession, savePersistedSession } from '@/lib/dbalSsoConfig'

interface SessionApiResponse {
  user: User | null
}

/**
 * Mirror the in-memory token into an httpOnly cookie.
 *
 * The DBAL proxy needs to know whether a request comes from a signed-in user,
 * and it only sees what the browser sends automatically -- the ~40 call sites
 * that write through it attach nothing themselves. Every place the token
 * changes calls this, so the cookie cannot drift from the session.
 *
 * Failure is deliberately silent: not being able to set the cookie must not
 * stop a login from completing. The consequence is writes being refused
 * until the next page load calls refresh(), not a broken session.
 */
async function syncSessionCookie(token: string | null): Promise<void> {
  try {
    await fetch(`${BASE_PATH}/api/auth/session`, {
      method: token === null ? 'DELETE' : 'POST',
      headers: token === null ? {} : { Authorization: `Bearer ${token}` },
    })
  } catch {
    // See above.
  }
}

export class AuthStore {
  private state: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
  }

  private readonly listeners = new Set<() => void>()
  private sessionCheckPromise: Promise<void> | null = null
  private refreshToken: string | null = null

  getState(): AuthState {
    return this.state
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private setState(newState: AuthState): void {
    this.state = newState
    this.listeners.forEach(listener => { listener(); })
  }

  private async loadProfile(token: string): Promise<void> {
    const response = await fetch(`${BASE_PATH}/api/auth/session`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const result = await response.json() as SessionApiResponse

    if (result.user === null) {
      throw new Error('Session token rejected')
    }

    this.setState({
      user: mapUserToAuthUser(result.user),
      isAuthenticated: true,
      isLoading: false,
    })
  }

  async ensureSessionChecked(): Promise<void> {
    this.sessionCheckPromise ??= this.refresh().finally(() => {
      this.sessionCheckPromise = null
    })
    return this.sessionCheckPromise
  }

  async logout(): Promise<void> {
    try {
      await oidcLogout(dbalSsoConfig, this.refreshToken)
    } finally {
      this.refreshToken = null
      setAuthToken(null)
      void syncSessionCookie(null)
      savePersistedSession(null)
      this.setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  }

  /** Rehydrates from a persisted token (valid or refreshable), or applies a
   * freshly-issued one from the OIDC callback page. */
  async refresh(): Promise<void> {
    this.setState({ ...this.state, isLoading: true })

    const persisted = loadPersistedSession()
    if (persisted === null) {
      this.setState({ user: null, isAuthenticated: false, isLoading: false })
      return
    }

    try {
      let token = persisted.token
      let refreshToken = persisted.refreshToken

      if (!isTokenValid(token)) {
        if (refreshToken === null) {
          throw new Error('Session expired')
        }
        const tokens = await refreshTokens(dbalSsoConfig, refreshToken)
        token = tokens.token
        refreshToken = tokens.refreshToken
        savePersistedSession({ token, refreshToken })
      }

      this.refreshToken = refreshToken
      setAuthToken(token)
      void syncSessionCookie(token)
      await this.loadProfile(token)
    } catch (error) {
      this.refreshToken = null
      setAuthToken(null)
      void syncSessionCookie(null)
      savePersistedSession(null)
      this.setState({ user: null, isAuthenticated: false, isLoading: false })
      console.error('Failed to refresh session', error)
    }
  }

  /** Applies a token pair obtained directly from the OIDC callback page
   * (already exchanged there), persisting and loading the profile. */
  async applySession(token: string, refreshToken: string | null): Promise<void> {
    this.refreshToken = refreshToken
    setAuthToken(token)
    void syncSessionCookie(token)
    savePersistedSession({ token, refreshToken })
    this.setState({ ...this.state, isLoading: true })
    try {
      await this.loadProfile(token)
    } catch (error) {
      this.refreshToken = null
      setAuthToken(null)
      savePersistedSession(null)
      this.setState({ user: null, isAuthenticated: false, isLoading: false })
      throw error
    }
  }
}

export const authStore = new AuthStore()
