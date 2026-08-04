'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  beginLogin,
  logout as oidcLogout,
  refreshTokens,
  setAuthToken,
  decodeJwtPayload,
  isTokenValid,
} from '@metabuilder/dbal-sso/core'
import { dbalSsoConfig, loadPersistedSession, savePersistedSession } from '../authConfig'

interface UseAuthReturn {
  token: string
  authed: boolean
  loading: boolean
  role: string | null
  username: string | null
  error: string | null
  handleLogin: () => void
  handleLogout: () => void
  clearError: () => void
}

export function useAuth(): UseAuthReturn {
  const [token, setToken] = useState('')
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [authed, setAuthed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const applySession = useCallback((tok: string, refresh: string | null) => {
    const claims = decodeJwtPayload(tok)
    setToken(tok)
    setRefreshToken(refresh)
    setAuthed(true)
    setRole(typeof claims.role === 'string' ? claims.role : null)
    setUsername(typeof claims.sub === 'string' ? claims.sub : null)
    setAuthToken(tok)
    savePersistedSession({ token: tok, refreshToken: refresh })
  }, [])

  const clearSession = useCallback(() => {
    setToken('')
    setRefreshToken(null)
    setAuthed(false)
    setRole(null)
    setUsername(null)
    setAuthToken(null)
    savePersistedSession(null)
  }, [])

  // Rehydrate on mount: a valid persisted token is applied directly, an
  // expired one is refreshed once (DBAL rotates refresh tokens, so this is
  // a single attempt, not a retry loop), anything else clears local state.
  useEffect(() => {
    const persisted = loadPersistedSession()
    if (!persisted) {
      setLoading(false)
      return
    }
    if (isTokenValid(persisted.token)) {
      applySession(persisted.token, persisted.refreshToken)
      setLoading(false)
      return
    }
    if (persisted.refreshToken) {
      refreshTokens(dbalSsoConfig, persisted.refreshToken)
        .then(tokens => applySession(tokens.token, tokens.refreshToken))
        .catch(() => clearSession())
        .finally(() => setLoading(false))
      return
    }
    clearSession()
    setLoading(false)
  }, [applySession, clearSession])

  const handleLogin = useCallback(() => {
    setError(null)
    beginLogin(dbalSsoConfig).catch(e => {
      setError(e instanceof Error ? e.message : 'Sign-in failed to start')
    })
  }, [])

  const handleLogout = useCallback(() => {
    void oidcLogout(dbalSsoConfig, refreshToken)
    clearSession()
  }, [refreshToken, clearSession])

  return {
    token,
    authed,
    loading,
    role,
    username,
    error,
    handleLogin,
    handleLogout,
    clearError: () => setError(null),
  }
}
