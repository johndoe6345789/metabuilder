'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { UnifiedLogin } from '@/components/UnifiedLogin'
import { getRoleHomePath } from '@/lib/auth'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, login, register } = useAuth()

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated) return

    if (user?.role) {
      router.replace(getRoleHomePath(user.role))
    } else {
      router.replace('/dashboard')
    }
  }, [isAuthenticated, isLoading, router, user?.role])

  return (
    <UnifiedLogin
      onLogin={({ username, password }) => login(username, password)}
      onRegister={(username, email, password) => register(username, email, password)}
      onBack={() => router.push('/')}
    />
  )
}
