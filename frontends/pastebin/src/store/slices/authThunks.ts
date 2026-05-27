import { createAsyncThunk } from '@reduxjs/toolkit'
import { setAuthToken } from '@/lib/authToken'

export interface AuthUser {
  id: string
  username: string
}

export interface AuthState {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

export function apiBase(): string {
  return (process.env.NEXT_PUBLIC_FLASK_BACKEND_URL ?? '').replace(/\/$/, '') || '/pastebin-api'
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
    { rejectWithValue }
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
  }
)

export const registerUser = createAsyncThunk(
  'auth/register',
  async (
    { username, password }: { username: string; password: string },
    { rejectWithValue }
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
  }
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
  }
)

export function onFulfilled(
  state: AuthState,
  action: { payload: { token: string; user: AuthUser } }
) {
  const { token, user } = action.payload
  state.loading = false; state.user = user; state.token = token
  state.isAuthenticated = true; setAuthToken(token)
}
