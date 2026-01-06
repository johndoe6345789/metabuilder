/**
 * useAuth hook - authentication state management
 * Provides user authentication state and methods
 */
import { useCallback, useEffect, useState } from 'react'

import { authStore } from './auth/auth-store'
import type { AuthState, UseAuthReturn } from './auth/auth-types'

export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>(authStore.getState())

  useEffect(() => {
    const unsubscribe = authStore.subscribe(() => { setState({ ...authStore.getState() }); })
    void authStore.ensureSessionChecked()
    return unsubscribe
  }, [])

  const login = useCallback(async (identifier: string, password: string) => {
    await authStore.login(identifier, password)
  }, [])

  const register = useCallback(async (username: string, email: string, password: string) => {
    await authStore.register(username, email, password)
  }, [])

  const logout = useCallback(async () => {
    await authStore.logout()
  }, [])

  const refresh = useCallback(async () => {
    await authStore.refresh()
  }, [])

  return {
    ...state,
    login,
    register,
    logout,
    refresh,
  }
}

export default useAuth
