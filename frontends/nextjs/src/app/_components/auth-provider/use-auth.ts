/**
 * useAuth hook
 */

import { useEffect, useState } from 'react'
import { getSessionUser } from '@/lib/routing'

export interface AuthUser {
  id: string
  username: string
  email: string
  role: string
  level: number
}

export interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })

  useEffect(() => {
    const loadUser = async () => {
      try {
        const sessionUser = await getSessionUser()
        if (sessionUser.user) {
          const user = sessionUser.user as any // Type assertion for now
          setState({
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              role: user.role,
              level: user.level || 0,
            },
            isLoading: false,
            isAuthenticated: true,
          })
        } else {
          setState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
          })
        }
      } catch (error) {
        console.error('Error loading user:', error)
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        })
      }
    }

    loadUser()
  }, [])

  return state
}
