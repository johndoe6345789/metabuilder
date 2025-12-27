"use client"

import { Level5 } from '@/components/level-tabs'
import { AuthGate } from '@/components/auth/AuthGate'
import { PageLoader } from '@/components/auth/PageLoader'
import { useResolvedUser } from '@/hooks/useResolvedUser'
import { useLevelRouting } from '@/hooks/useLevelRouting'

export default function SuperGodPage() {
  const { user, isLoading } = useResolvedUser()
  const { onNavigate, onLogout, onPreview } = useLevelRouting()

  return (
    <AuthGate requiredRole="supergod">
      {isLoading || !user ? (
        <PageLoader message="Loading supergod console..." />
      ) : (
        <Level5 user={user} onLogout={onLogout} onNavigate={onNavigate} onPreview={onPreview} />
      )}
    </AuthGate>
  )
}
