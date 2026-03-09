import { createAsyncThunk, createSlice, type Action } from '@reduxjs/toolkit'
import { setAuthToken } from '@/lib/authToken'

export interface AuthUser {
  id: string
  username: string
}

interface AuthState {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
}

function apiBase(): string {
  return (process.env.NEXT_PUBLIC_FLASK_BACKEND_URL ?? '').replace(/\/$/, '') || '/pastebin-api'
}

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ username, password }: { username: string; password: string }, { rejectWithValue }) => {
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
  async ({ username, password }: { username: string; password: string }, { rejectWithValue }) => {
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

function isTokenValid(token: string | null): boolean {
  if (!token) return false
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    if (!payload.exp) return false
    return payload.exp * 1000 > Date.now()
  } catch {
    return false
  }
}

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

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.error = null
      setAuthToken(null)
    },
    clearError(state) {
      state.error = null
    },
    // Called during store rehydration to seed the token bridge
    seedToken(state) {
      if (state.token) setAuthToken(state.token)
    },
  },
  extraReducers: (builder) => {
    const onPending = (state: AuthState) => {
      state.loading = true
      state.error = null
    }
    const onFulfilled = (
      state: AuthState,
      action: { payload: { token: string; user: AuthUser } }
    ) => {
      state.loading = false
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
      setAuthToken(action.payload.token)
    }
    const onRejected = (state: AuthState, action: { payload: unknown }) => {
      state.loading = false
      state.error = action.payload as string
    }

    builder
      .addCase(loginUser.pending,    onPending)
      .addCase(loginUser.fulfilled,  onFulfilled)
      .addCase(loginUser.rejected,   onRejected)
      .addCase(registerUser.pending,   onPending)
      .addCase(registerUser.fulfilled, onFulfilled)
      .addCase(registerUser.rejected,  onRejected)
      .addCase(validateToken.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        setAuthToken(action.payload.token)
      })
      .addCase(validateToken.rejected, (state) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
        setAuthToken(null)
      })
      .addMatcher(
        (action: Action) => action.type === 'persist/REHYDRATE',
        (state) => {
          state.error = null
          state.loading = false
          if (state.token && !isTokenValid(state.token)) {
            state.user = null
            state.token = null
            state.isAuthenticated = false
            setAuthToken(null)
          }
        },
      )
  },
})

export const { logout, clearError, seedToken } = authSlice.actions
export default authSlice.reducer
