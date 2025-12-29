'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { fetchSession } from '@/lib/auth/api/fetch-session'
import { login as loginRequest } from '@/lib/auth/api/login'
import { logout as logoutRequest } from '@/lib/auth/api/logout'
import { register as registerRequest } from '@/lib/auth/api/register'
import type { User } from '@/lib/level-types'

import { AuthContext } from './auth-context'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for existing session
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const sessionUser = await fetchSession()
      setUser(sessionUser)
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (username: string, password: string) => {
    const authenticated = await loginRequest(username, password)
    setUser(authenticated)

    // Redirect based on role
    if (authenticated.role === 'supergod') {
      router.push('/(auth)/supergod')
    } else if (authenticated.role === 'god') {
      router.push('/(auth)/builder')
    } else if (authenticated.role === 'admin') {
      router.push('/(auth)/admin')
    } else {
      router.push('/(auth)/dashboard')
    }
  }

  const register = async (username: string, email: string, password: string) => {
    const registered = await registerRequest(username, email, password)
    setUser(registered)
    router.push('/(auth)/dashboard')
  }

  const logout = async () => {
    await logoutRequest()
    setUser(null)
    router.push('/')
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}
