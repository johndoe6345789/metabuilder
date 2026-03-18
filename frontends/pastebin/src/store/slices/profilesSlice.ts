import { createAsyncThunk, createSlice, type Action } from '@reduxjs/toolkit'
import { getAuthToken } from '@/lib/authToken'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UserProfile {
  id: string
  username: string
  bio: string
  createdAt: number
}

interface ProfilesState {
  byUsername: Record<string, UserProfile>
  loading: boolean
  error: string | null
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function apiBase(): string {
  return (process.env.NEXT_PUBLIC_FLASK_BACKEND_URL ?? '').replace(/\/$/, '') || '/pastebin-api'
}

function authHeaders(): Record<string, string> {
  const token = getAuthToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function getUsername(): string {
  const token = getAuthToken()
  if (!token) return ''
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.username ?? ''
  } catch {
    return ''
  }
}

function toUserProfile(raw: Record<string, unknown>): UserProfile {
  return {
    id: raw.id as string,
    username: raw.username as string,
    bio: (raw.bio as string) ?? '',
    createdAt: Number(raw.createdAt) || 0,
  }
}

// ---------------------------------------------------------------------------
// Thunks
// ---------------------------------------------------------------------------

export const fetchUserProfile = createAsyncThunk(
  'profiles/fetchUserProfile',
  async (username: string, { rejectWithValue }) => {
    try {
      const res = await fetch(`${apiBase()}/api/profile?username=${encodeURIComponent(username)}`, {
        headers: authHeaders(),
      })
      if (!res.ok) return rejectWithValue(`Failed to fetch profile: ${res.statusText}`)
      const data = await res.json()
      if (!data.id) return null
      return toUserProfile(data)
    } catch {
      return rejectWithValue('Network error')
    }
  }
)

export const updateMyProfile = createAsyncThunk(
  'profiles/updateMyProfile',
  async (bio: string, { rejectWithValue }) => {
    try {
      const res = await fetch(`${apiBase()}/api/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ bio }),
      })
      if (!res.ok) return rejectWithValue(`Failed to update profile: ${res.statusText}`)
      const data = await res.json()
      return toUserProfile(data)
    } catch {
      return rejectWithValue('Network error')
    }
  }
)

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------

const initialState: ProfilesState = {
  byUsername: {},
  loading: false,
  error: null,
}

const profilesSlice = createSlice({
  name: 'profiles',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // fetchUserProfile
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload) {
          state.byUsername[action.payload.username] = action.payload
        }
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // updateMyProfile
    builder
      .addCase(updateMyProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateMyProfile.fulfilled, (state, action) => {
        state.loading = false
        const profile = action.payload
        const username = profile.username || getUsername()
        if (username) {
          state.byUsername[username] = profile
        }
      })
      .addCase(updateMyProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Reset transient state on rehydrate
    builder.addMatcher(
      (action: Action) => action.type === 'persist/REHYDRATE',
      (state) => {
        state.loading = false
        state.error = null
      },
    )
  },
})

export default profilesSlice.reducer
