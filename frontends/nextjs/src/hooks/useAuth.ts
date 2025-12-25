/**
 * useAuth hook - simple authentication state management
 * Provides user authentication state and methods
 */
import { useState, useEffect, useCallback } from 'react'

export interface AuthUser {
  id: string
  email: string
  name?: string
  role?: 'user' | 'admin' | 'god' | 'supergod'
  level?: number
}

export interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface UseAuthReturn extends AuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

// Simple in-memory auth state for now
// TODO: Implement proper auth with backend/Prisma
let authState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
}

const listeners = new Set<() => void>()

function notifyListeners() {
  listeners.forEach((listener) => listener())
}

export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>(authState)

  useEffect(() => {
    const listener = () => setState({ ...authState })
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  const login = useCallback(async (email: string, _password: string) => {
    authState = { ...authState, isLoading: true }
    notifyListeners()

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 100))

    authState = {
      user: { id: '1', email, name: email.split('@')[0] },
      isAuthenticated: true,
      isLoading: false,
    }
    notifyListeners()
  }, [])

  const logout = useCallback(async () => {
    authState = { ...authState, isLoading: true }
    notifyListeners()

    await new Promise((resolve) => setTimeout(resolve, 100))

    authState = {
      user: null,
      isAuthenticated: false,
      isLoading: false,
    }
    notifyListeners()
  }, [])

  const refresh = useCallback(async () => {
    // No-op for now, would refresh token/session
  }, [])

  return {
    ...state,
    login,
    logout,
    refresh,
  }
}

export default useAuth
