import { createAsyncThunk } from '@reduxjs/toolkit'
import { beginLogin, completeLogin, isTokenValid } from '@metabuilder/dbal-sso/core'
import { setAuthToken } from '@/lib/authToken'
import { dbalSsoConfig } from '@/lib/dbalSsoConfig'

export interface AuthUser {
  id: string
  username: string
}

export interface AuthState {
  user: AuthUser | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

export function apiBase(): string {
  return (
    (process.env.NEXT_PUBLIC_FLASK_BACKEND_URL ?? '').replace(/\/$/, '') ||
    '/pastebin-api'
  )
}

export { isTokenValid }

/**
 * Redirects the browser to DBAL's /oidc/authorize -- see
 * @metabuilder/dbal-sso's beginLogin for the PKCE/sessionStorage details,
 * read back by /auth/callback via completeOidcLogin below once DBAL
 * redirects here with ?code=&state=.
 */
export async function beginOidcLogin(): Promise<void> {
  await beginLogin(dbalSsoConfig)
}

export const loginUser = createAsyncThunk(
  'auth/login',
  async (
    { username, password }: { username: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await fetch(`${apiBase()}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (!res.ok) return rejectWithValue(data.error ?? 'Login failed')
      return data as { token: string; user: AuthUser }
    } catch {
      return rejectWithValue('Network error')
    }
  },
)

export const registerUser = createAsyncThunk(
  'auth/register',
  async (
    { username, password }: { username: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await fetch(`${apiBase()}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (!res.ok) return rejectWithValue(data.error ?? 'Registration failed')
      return data as { token: string; user: AuthUser }
    } catch {
      return rejectWithValue('Network error')
    }
  },
)

export const completeOidcLogin = createAsyncThunk(
  'auth/completeOidcLogin',
  async ({ code, state }: { code: string; state: string }, { rejectWithValue }) => {
    try {
      const tokens = await completeLogin(dbalSsoConfig, code, state)
      return {
        token: tokens.token,
        refreshToken: tokens.refreshToken,
        user: tokens.user satisfies AuthUser,
      }
    } catch (e) {
      return rejectWithValue(e instanceof Error ? e.message : 'Sign-in failed')
    }
  },
)

export const validateToken = createAsyncThunk(
  'auth/validateToken',
  async (_, { getState, rejectWithValue }) => {
    const { auth } = getState() as { auth: AuthState }
    if (!auth.token) return rejectWithValue('No token')
    try {
      const res = await fetch(`${apiBase()}/api/auth/me`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      if (!res.ok) return rejectWithValue('Invalid token')
      const data = await res.json()
      return { user: data as AuthUser, token: auth.token }
    } catch {
      return rejectWithValue('Network error')
    }
  },
)

export function onFulfilled(
  state: AuthState,
  action: { payload: { token: string; user: AuthUser; refreshToken?: string | null } },
) {
  const { token, user, refreshToken } = action.payload
  state.loading = false
  state.user = user
  state.token = token
  state.refreshToken = refreshToken ?? null
  state.isAuthenticated = true
  setAuthToken(token)
}
