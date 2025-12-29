'use client'

import { AuthGate } from '@/components/auth/AuthGate'
import { PageLoader } from '@/components/auth/PageLoader'
import { Level2 } from '@/components/Level2'
import { useLevelRouting } from '@/hooks/useLevelRouting'
import { useResolvedUser } from '@/hooks/useResolvedUser'

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
