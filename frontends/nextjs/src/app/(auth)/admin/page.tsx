'use client'

import { Level3 } from '@/components/Level3'
import { AuthGate } from '@/components/auth/AuthGate'
import { PageLoader } from '@/components/auth/PageLoader'
import { useResolvedUser } from '@/hooks/useResolvedUser'
import { useLevelRouting } from '@/hooks/useLevelRouting'

export default function AdminPage() {
  const { user, isLoading } = useResolvedUser()
  const { onNavigate, onLogout } = useLevelRouting()

  return (
    <AuthGate requiredRole="admin">
      {isLoading || !user ? (
        <PageLoader message="Loading admin workspace..." />
      ) : (
        <Level3 user={user} onLogout={onLogout} onNavigate={onNavigate} />
      )}
    </AuthGate>
  )
}
