import type { UserRole } from '../types/level-types'
import { getRoleLevel } from './get-role-level'

export type AccessDecisionReason = 'loading' | 'unauthenticated' | 'insufficient_level'

export interface AccessDecisionInput {
  isAuthenticated: boolean
  isLoading: boolean
  requiresAuth: boolean
  requiredLevel?: number
  userRole?: UserRole
  userLevel?: number
}

export interface AccessDecision {
  allowed: boolean
  reason?: AccessDecisionReason
}

/**
 * Resolve access decisions for UI gates without side effects.
 */
export function resolveAccessDecision({
  isAuthenticated,
  isLoading,
  requiresAuth,
  requiredLevel,
  userRole,
  userLevel,
}: AccessDecisionInput): AccessDecision {
  if (isLoading) {
    return { allowed: false, reason: 'loading' }
  }

  if (requiresAuth && !isAuthenticated) {
    return { allowed: false, reason: 'unauthenticated' }
  }

  const effectiveUserLevel = userLevel ?? (userRole ? getRoleLevel(userRole) : 0)

  if (requiredLevel !== undefined && effectiveUserLevel < requiredLevel) {
    return { allowed: false, reason: 'insufficient_level' }
  }

  return { allowed: true }
}
