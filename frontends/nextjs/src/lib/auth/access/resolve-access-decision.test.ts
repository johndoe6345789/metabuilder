import { describe, expect,it } from 'vitest'

import { resolveAccessDecision } from './resolve-access-decision'

describe('resolveAccessDecision', () => {
  it('returns loading when auth is loading', () => {
    const decision = resolveAccessDecision({
      isAuthenticated: false,
      isLoading: true,
      requiresAuth: true,
    })

    expect(decision).toEqual({ allowed: false, reason: 'loading' })
  })

  it('blocks unauthenticated access when auth is required', () => {
    const decision = resolveAccessDecision({
      isAuthenticated: false,
      isLoading: false,
      requiresAuth: true,
    })

    expect(decision).toEqual({ allowed: false, reason: 'unauthenticated' })
  })

  it('blocks users below the required level', () => {
    const decision = resolveAccessDecision({
      isAuthenticated: true,
      isLoading: false,
      requiresAuth: true,
      requiredLevel: 3,
      userRole: 'user',
    })

    expect(decision).toEqual({ allowed: false, reason: 'insufficient_level' })
  })

  it('allows access when the required level is met', () => {
    const decision = resolveAccessDecision({
      isAuthenticated: true,
      isLoading: false,
      requiresAuth: true,
      requiredLevel: 2,
      userRole: 'user',
    })

    expect(decision).toEqual({ allowed: true })
  })

  it('uses userLevel when provided', () => {
    const decision = resolveAccessDecision({
      isAuthenticated: true,
      isLoading: false,
      requiresAuth: true,
      requiredLevel: 4,
      userLevel: 4,
    })

    expect(decision).toEqual({ allowed: true })
  })
})
