/**
 * Auth provider component (stub)
 */

import type { ReactNode } from 'react'

export interface AuthProviderProps {
  children: ReactNode
}

export function AuthProviderComponent({ children }: AuthProviderProps) {
  // TODO: Implement auth provider
  return children
}

// Alias for compatibility
export const AuthProvider = AuthProviderComponent
