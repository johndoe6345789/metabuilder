'use client'

import { AuthGate } from '@/components/auth/AuthGate'
import { PageLoader } from '@/components/auth/PageLoader'
import { Level4 } from '@/components/Level4'
import { useLevelRouting } from '@/hooks/useLevelRouting'
import { useResolvedUser } from '@/hooks/useResolvedUser'

export default function BuilderPage() {
  const { user, isLoading } = useResolvedUser()
  const { onNavigate, onLogout, onPreview } = useLevelRouting()

  return (
    <AuthGate requiredRole="god">
      {isLoading || !user ? (
        <PageLoader message="Loading builder tools..." />
      ) : (
        <Level4 user={user} onLogout={onLogout} onNavigate={onNavigate} onPreview={onPreview} />
      )}
    </AuthGate>
  )
}
