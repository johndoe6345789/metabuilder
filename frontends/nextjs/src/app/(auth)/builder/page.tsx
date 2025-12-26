"use client"

import { Level4 } from '@/components/Level4'
import { AuthGate } from '@/components/auth/AuthGate'
import { PageLoader } from '@/components/auth/PageLoader'
import { useResolvedUser } from '@/hooks/useResolvedUser'
import { useLevelRouting } from '@/hooks/useLevelRouting'

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
