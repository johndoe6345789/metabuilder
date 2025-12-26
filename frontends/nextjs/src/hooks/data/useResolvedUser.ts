import { useEffect, useState } from 'react'
import { Database } from '@/lib/database'
import type { User } from '@/lib/level-types'
import { useAuth } from '../useAuth'

export interface ResolvedUserState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export function useResolvedUser(): ResolvedUserState {
  const { user: authUser, isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let active = true

    if (!authUser?.id) {
      setUser(null)
      setIsLoading(false)
      return () => {
        active = false
      }
    }

    setIsLoading(true)
    Database.getUserById(authUser.id)
      .then((loaded) => {
        if (active) {
          setUser(loaded)
        }
      })
      .catch(() => {
        if (active) {
          setUser(null)
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [authUser?.id])

  return {
    user,
    isAuthenticated,
    isLoading: isAuthLoading || isLoading,
  }
}
