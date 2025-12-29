'use client'

import { AuthGate } from '@/components/auth/AuthGate'
import { PageLoader } from '@/components/auth/PageLoader'
import { Level3 } from '@/components/Level3'
import { useLevelRouting } from '@/hooks/useLevelRouting'
import { useResolvedUser } from '@/hooks/useResolvedUser'

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
