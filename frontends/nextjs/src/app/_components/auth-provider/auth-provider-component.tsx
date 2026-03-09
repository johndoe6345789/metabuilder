/**
 * Auth provider component
 * 
 * Provides authentication context to the application.
 * Wraps children with auth state from useAuth hook.
 */
'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { useAuth, type AuthState } from './use-auth'
import { getRoleLevel } from '@/lib/constants'

export interface AuthContextValue extends AuthState {
  /** Check if user has at least the specified role level */
  hasLevel: (minLevel: number) => boolean
  /** Check if user has the specified role */
  hasRole: (role: string) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export interface AuthProviderProps {
  children: ReactNode
}

export function AuthProviderComponent({ children }: AuthProviderProps) {
  const authState = useAuth()
  
  const hasLevel = (minLevel: number): boolean => {
    if (authState.user === null) {
      return minLevel <= 0
    }
    const userLevel = getRoleLevel(authState.user.role ?? 'user')
    return userLevel >= minLevel
  }
  
  const hasRole = (role: string): boolean => {
    if (authState.user === null) {
      return role === 'public'
    }
    return authState.user.role === role
  }
  
  const value: AuthContextValue = {
    ...authState,
    hasLevel,
    hasRole,
  }
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Hook to access auth context
 * Must be used within AuthProviderComponent
 */
export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext)
  if (context === null) {
    throw new Error('useAuthContext must be used within AuthProviderComponent')
  }
  return context
}

// Alias for compatibility
export const AuthProvider = AuthProviderComponent
