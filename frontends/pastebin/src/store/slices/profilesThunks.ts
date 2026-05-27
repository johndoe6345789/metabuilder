import { createAsyncThunk } from '@reduxjs/toolkit'
import { getAuthToken } from '@/lib/authToken'

export interface UserProfile {
  id: string
  username: string
  bio: string
  createdAt: number
}

export function apiBase(): string {
  return (
    (process.env.NEXT_PUBLIC_FLASK_BACKEND_URL ?? '').replace(/\/$/, '')
    || '/pastebin-api'
  )
}

export function authHeaders(): Record<string, string> {
  const token = getAuthToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export function getUsername(): string {
  const token = getAuthToken()
  if (!token) return ''
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.username ?? ''
  } catch {
    return ''
  }
}

export function toUserProfile(raw: Record<string, unknown>): UserProfile {
  return {
    id: raw.id as string,
    username: raw.username as string,
    bio: (raw.bio as string) ?? '',
    createdAt: Number(raw.createdAt) || 0,
  }
}

export const fetchUserProfile = createAsyncThunk(
  'profiles/fetchUserProfile',
  async (username: string, { rejectWithValue }) => {
    try {
      const url = `${apiBase()}/api/profile?username=${encodeURIComponent(username)}`
      const res = await fetch(url, { headers: authHeaders() })
      if (!res.ok)
        return rejectWithValue(`Failed to fetch profile: ${res.statusText}`)
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
      if (!res.ok)
        return rejectWithValue(`Failed to update profile: ${res.statusText}`)
      const data = await res.json()
      return toUserProfile(data)
    } catch {
      return rejectWithValue('Network error')
    }
  }
)
