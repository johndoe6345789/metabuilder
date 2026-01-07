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

const toAuthUser = (value: Record<string, unknown>): AuthUser | null => {
  const id = value.id
  const username = value.username
  const email = value.email
  const role = value.role
  const level = value.level

  if (
    typeof id !== 'string' ||
    typeof username !== 'string' ||
    typeof email !== 'string' ||
    typeof role !== 'string'
  ) {
    return null
  }

  let resolvedLevel = 0
  if (typeof level === 'number') {
    resolvedLevel = level
  } else if (typeof level === 'bigint') {
    resolvedLevel = Number(level)
  }

  return {
    id,
    username,
    email,
    role,
    level: resolvedLevel,
  }
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
        if (sessionUser.user !== null) {
          const user = toAuthUser(sessionUser.user)
          if (user === null) {
            setState({
              user: null,
              isLoading: false,
              isAuthenticated: false,
            })
            return
          }
          setState({
            user,
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
      } catch {
        // Error loading user - log in development only
        if (process.env.NODE_ENV === 'development') {
          console.error('Error loading user')
        }
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        })
      }
    }

    void loadUser()
  }, [])

  return state
}
