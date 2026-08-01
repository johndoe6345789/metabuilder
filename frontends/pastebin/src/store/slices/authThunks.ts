import { createAsyncThunk } from '@reduxjs/toolkit'
import { setAuthToken } from '@/lib/authToken'

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

// DBAL's OIDC endpoints — the browser talks to DBAL directly for the
// PKCE dance, not through Flask (Flask only ever verifies the resulting
// tokens, it never sees the authorization code or the exchange).
export function dbalOidcBase(): string {
  return (process.env.NEXT_PUBLIC_DBAL_OIDC_BASE_URL ?? '').replace(/\/$/, '')
}

export function dbalOidcClientId(): string {
  return process.env.NEXT_PUBLIC_DBAL_OIDC_CLIENT_ID ?? 'pastebin-web'
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function randomString(byteLength: number): string {
  const bytes = new Uint8Array(byteLength)
  crypto.getRandomValues(bytes)
  return base64UrlEncode(bytes)
}

async function sha256Base64Url(input: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input))
  return base64UrlEncode(new Uint8Array(digest))
}

const PKCE_VERIFIER_KEY = 'dbal_oidc_pkce_verifier'
const PKCE_STATE_KEY = 'dbal_oidc_state'

/**
 * Redirects the browser to DBAL's /oidc/authorize, having stashed the PKCE
 * code_verifier (and state, for CSRF protection) in sessionStorage — read
 * back by /auth/callback once DBAL redirects here with ?code=&state=.
 */
export async function beginOidcLogin(): Promise<void> {
  const verifier = randomString(32)
  const challenge = await sha256Base64Url(verifier)
  const state = randomString(16)

  sessionStorage.setItem(PKCE_VERIFIER_KEY, verifier)
  sessionStorage.setItem(PKCE_STATE_KEY, state)

  const redirectUri = `${window.location.origin}/auth/callback`
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: dbalOidcClientId(),
    redirect_uri: redirectUri,
    scope: 'openid profile offline_access',
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  })
  window.location.assign(`${dbalOidcBase()}/oidc/authorize?${params.toString()}`)
}

function decodeJwtPayload(token: string): Record<string, unknown> {
  return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
}

export function isTokenValid(token: string | null): boolean {
  if (!token) return false
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    if (!payload.exp) return false
    return payload.exp * 1000 > Date.now()
  } catch {
    return false
  }
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
    const storedState = sessionStorage.getItem(PKCE_STATE_KEY)
    const verifier = sessionStorage.getItem(PKCE_VERIFIER_KEY)
    sessionStorage.removeItem(PKCE_STATE_KEY)
    sessionStorage.removeItem(PKCE_VERIFIER_KEY)

    if (!verifier || !storedState || storedState !== state) {
      return rejectWithValue('Sign-in session expired or invalid — please try again')
    }

    try {
      const redirectUri = `${window.location.origin}/auth/callback`
      const res = await fetch(`${dbalOidcBase()}/oidc/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
          client_id: dbalOidcClientId(),
          code_verifier: verifier,
        }),
      })
      const data = await res.json()
      if (!res.ok) return rejectWithValue(data.error_description ?? data.error ?? 'Sign-in failed')

      const claims = decodeJwtPayload(data.access_token as string)
      const username = (claims.sub as string) ?? ''
      if (!username) return rejectWithValue('Sign-in failed — malformed token')

      return {
        token: data.access_token as string,
        refreshToken: (data.refresh_token as string) ?? null,
        user: { id: username, username } satisfies AuthUser,
      }
    } catch {
      return rejectWithValue('Network error')
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
