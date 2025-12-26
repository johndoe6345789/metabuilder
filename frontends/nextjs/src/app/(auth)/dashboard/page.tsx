"use client"

import { Level2 } from '@/components/Level2'
import { AuthGate } from '@/components/auth/AuthGate'
import { PageLoader } from '@/components/auth/PageLoader'
import { useResolvedUser } from '@/hooks/useResolvedUser'
import { useLevelRouting } from '@/hooks/useLevelRouting'

export default function DashboardPage() {
  const { user, isLoading } = useResolvedUser()
  const { onNavigate, onLogout } = useLevelRouting()

  return (
    <AuthGate requiredRole="user">
      {isLoading || !user ? (
        <PageLoader message="Loading dashboard..." />
      ) : (
        <Level2 user={user} onLogout={onLogout} onNavigate={onNavigate} />
      )}
    </AuthGate>
  )
}
