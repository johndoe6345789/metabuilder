import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'

const auth = vi.hoisted(() => ({ value: null as unknown }))
vi.mock('@/app/_components/auth-provider/auth-provider-component', () => ({
  useAuthContext: () => auth.value,
}))

const nav = vi.hoisted(() => ({ params: {} as Record<string, unknown> }))
vi.mock('next/navigation', () => ({
  useParams: () => nav.params,
}))

import { asUser, authValue } from '@/test/auth-harness'
import { useShellIdentity } from './use-shell-identity'

beforeEach(() => {
  nav.params = {}
})

describe('useShellIdentity', () => {
  it('is level 0, public, "User" when signed out', () => {
    auth.value = authValue(null)
    const { result } = renderHook(() => useShellIdentity())
    expect(result.current.userLevel).toBe(0)
    expect(result.current.role).toBe('public')
    expect(result.current.username).toBe('User')
  })

  it('reads the level from the user\'s role', () => {
    auth.value = authValue(asUser({ role: 'admin' }))
    expect(renderHook(() => useShellIdentity()).result.current.userLevel).toBe(
      3
    )
  })

  it('prefers the username over the display name', () => {
    auth.value = authValue(asUser({ username: 'alice' }))
    expect(
      renderHook(() => useShellIdentity()).result.current.username
    ).toBe('alice')
  })

  it('takes the tenant from the URL over the user\'s own', () => {
    nav.params = { tenantSlug: 'from-url' }
    auth.value = authValue(asUser({ tenantId: 'from-user' }))
    expect(
      renderHook(() => useShellIdentity()).result.current.tenantId
    ).toBe('from-url')
  })

  it('falls back to the user\'s tenant with no URL slug', () => {
    nav.params = {}
    auth.value = authValue(asUser({ tenantId: 'acme' }))
    expect(
      renderHook(() => useShellIdentity()).result.current.tenantId
    ).toBe('acme')
  })

  it('normalises a missing tenant to system', () => {
    auth.value = authValue(null)
    expect(
      renderHook(() => useShellIdentity()).result.current.tenantId
    ).toBe('system')
  })
})
