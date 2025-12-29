'use client'

import { ModeratorPanel } from '@/components/level/ModeratorPanel'
import { AuthGate } from '@/components/auth/AuthGate'
import { PageLoader } from '@/components/auth/PageLoader'
import { useResolvedUser } from '@/hooks/useResolvedUser'
import { useLevelRouting } from '@/hooks/useLevelRouting'

export default function ModeratorPage() {
  const { user, isLoading } = useResolvedUser()
  const { onNavigate, onLogout } = useLevelRouting()

  return (
    <AuthGate requiredRole="moderator">
      {isLoading || !user ? (
        <PageLoader message="Loading moderator desk..." />
      ) : (
        <ModeratorPanel user={user} onLogout={onLogout} onNavigate={onNavigate} />
      )}
    </AuthGate>
  )
}
