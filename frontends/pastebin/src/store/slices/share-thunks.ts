/**
 * Share thunks and DBAL helpers
 */

import { createAsyncThunk } from '@reduxjs/toolkit'
import { createAuthenticatedFetch } from '@metabuilder/dbal-sso/core'
import type { Snippet } from '@/lib/types'
import { getStorageConfig } from '@/lib/storage'
import { getAuthToken } from '@/lib/authToken'
import { dbalSsoConfig } from '@/lib/dbalSsoConfig'
import { tokensRefreshed, logout } from './authSlice'
import type { AuthState } from './authThunks'

export interface SharedSnippet extends Snippet {
  authorUsername?: string
}

const DBAL_TENANT = 'pastebin'
const DBAL_PACKAGE = 'pastebin'

function dbalBaseUrl(): string {
  return (getStorageConfig().dbalUrl ?? '').replace(/\/$/, '')
}

function entityUrl(entity: string): string {
  return `${dbalBaseUrl()}/${DBAL_TENANT}/${DBAL_PACKAGE}/${entity}`
}

function authHeaders(): Record<string, string> {
  const token = getAuthToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export function parseSnippet(raw: Record<string, unknown>): SharedSnippet {
  return {
    id: raw.id as string,
    title: raw.title as string,
    description: (raw.description as string) ?? '',
    code: raw.code as string,
    language: raw.language as string,
    category: (raw.category as string) ?? '',
    namespaceId: raw.namespaceId as string | undefined,
    hasPreview: raw.hasPreview as boolean | undefined,
    isTemplate: raw.isTemplate as boolean | undefined,
    functionName: raw.functionName as string | undefined,
    inputParameters:
      typeof raw.inputParameters === 'string'
        ? JSON.parse(raw.inputParameters || '[]')
        : (raw.inputParameters as SharedSnippet['inputParameters']),
    files:
      typeof raw.files === 'string'
        ? JSON.parse(raw.files || '[]')
        : (raw.files as SharedSnippet['files']),
    entryPoint: raw.entryPoint as string | undefined,
    createdAt: Number(raw.createdAt) || 0,
    updatedAt: Number(raw.updatedAt) || Number(raw.createdAt) || 0,
    shareToken: raw.shareToken as string | undefined,
    authorUsername: raw.authorUsername as string | undefined,
  }
}

export const generateShareToken = createAsyncThunk(
  'share/generateShareToken',
  async (snippetId: string, { getState, dispatch, rejectWithValue }) => {
    try {
      const { auth } = getState() as { auth: AuthState }
      const dbalFetch = createAuthenticatedFetch(dbalSsoConfig, {
        getRefreshToken: () => auth.refreshToken,
        onRefreshed: tokens => dispatch(tokensRefreshed(tokens)),
        onAuthFailure: () => dispatch(logout()),
      })
      const token = crypto.randomUUID()
      const res = await dbalFetch(`${entityUrl('Snippet')}/${snippetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shareToken: token }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        return rejectWithValue(
          data.error ?? `Failed to generate share token: ${res.statusText}`,
        )
      }
      return { snippetId, token }
    } catch {
      return rejectWithValue('Network error')
    }
  },
)

export const revokeShareToken = createAsyncThunk(
  'share/revokeShareToken',
  async (snippetId: string, { getState, dispatch, rejectWithValue }) => {
    try {
      const { auth } = getState() as { auth: AuthState }
      const dbalFetch = createAuthenticatedFetch(dbalSsoConfig, {
        getRefreshToken: () => auth.refreshToken,
        onRefreshed: tokens => dispatch(tokensRefreshed(tokens)),
        onAuthFailure: () => dispatch(logout()),
      })
      const res = await dbalFetch(`${entityUrl('Snippet')}/${snippetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shareToken: null }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        return rejectWithValue(
          data.error ?? `Failed to revoke share token: ${res.statusText}`,
        )
      }
      return snippetId
    } catch {
      return rejectWithValue('Network error')
    }
  },
)

export const fetchSharedSnippet = createAsyncThunk(
  'share/fetchSharedSnippet',
  async (token: string, { rejectWithValue }) => {
    try {
      const url =
        `${entityUrl('Snippet')}?filter.shareToken=` +
        `${encodeURIComponent(token)}&limit=1`
      let res = await fetch(url)
      if (res.status === 401 || res.status === 403) {
        const headers = authHeaders()
        if (headers.Authorization) res = await fetch(url, { headers })
      }
      if (!res.ok) {
        return rejectWithValue(
          `Failed to fetch shared snippet: ${res.statusText}`,
        )
      }
      const json = await res.json()
      const items: Record<string, unknown>[] =
        json.data?.data ?? json.data ?? []
      if (!Array.isArray(items) || items.length === 0) return null
      return parseSnippet(items[0])
    } catch {
      return rejectWithValue('Network error')
    }
  },
)
