"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CircularProgress, Stack, Typography } from '@mui/material'
import type { AppLevel, UserRole } from '@/lib/level-types'
import { getRoleLevel } from '@/lib/auth/get-role-level'
import { resolveAccessDecision } from '@/lib/auth/resolve-access-decision'
import { useAuth } from '@/hooks/useAuth'
import { AccessDenied } from './AccessDenied'

interface AuthGateProps {
  children: React.ReactNode
  minLevel?: AppLevel
  requiredRole?: UserRole
  requiresAuth?: boolean
  redirectTo?: string
  fallback?: React.ReactNode
}

export function AuthGate({
  children,
  minLevel,
  requiredRole,
  requiresAuth,
  redirectTo = '/login',
  fallback,
}: AuthGateProps) {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const mustAuthenticate = requiresAuth ?? Boolean(minLevel || requiredRole)
  const requiredLevel = minLevel ?? (requiredRole ? getRoleLevel(requiredRole) : undefined)

  const decision = resolveAccessDecision({
    isAuthenticated,
    isLoading,
    requiresAuth: mustAuthenticate,
    requiredLevel,
    userRole: user?.role,
    userLevel: user?.level,
  })

  useEffect(() => {
    if (!decision.allowed && decision.reason !== 'loading' && redirectTo) {
      router.replace(redirectTo)
    }
  }, [decision.allowed, decision.reason, redirectTo, router])

  if (decision.reason === 'loading') {
    return (
      <Stack spacing={2} alignItems="center" justifyContent="center" sx={{ minHeight: '50vh' }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Checking access...
        </Typography>
      </Stack>
    )
  }

  if (!decision.allowed) {
    if (fallback) {
      return <>{fallback}</>
    }

    const description = decision.reason === 'unauthenticated'
      ? 'Please sign in to continue.'
      : 'Your account does not have the required access level.'

    return (
      <AccessDenied
        title="Access restricted"
        description={description}
        actionLabel="Go to login"
        onAction={() => router.replace(redirectTo)}
      />
    )
  }

  return <>{children}</>
}
