import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'

const nav = vi.hoisted(() => ({ useParams: vi.fn() }))
const auth = vi.hoisted(() => ({ useAuthContext: vi.fn() }))
vi.mock('next/navigation', () => nav)
vi.mock('@/app/_components/auth-provider/auth-provider-component', () => auth)

import { useRouteTenant } from './use-route-tenant'

beforeEach(() => {
  vi.clearAllMocks()
  nav.useParams.mockReturnValue({})
  auth.useAuthContext.mockReturnValue({ user: null })
})

/**
 * Every screen that guessed the tenant guessed wrong in its own way: the
 * chat asked for the constant 'default', so every community that signed
 * in on this browser shared one set of rooms, and the stream apps read
 * and wrote a hardcoded `system`.
 */
describe('useRouteTenant', () => {
  it('is the community whose page this is', () => {
    nav.useParams.mockReturnValue({ tenantSlug: 'harbour_cycle_works' })
    const { result } = renderHook(() => useRouteTenant())
    expect(result.current).toBe('harbour_cycle_works')
  })

  it("falls back to the signed-in user's own community", () => {
    auth.useAuthContext.mockReturnValue({ user: { tenantId: 'acme' } })
    const { result } = renderHook(() => useRouteTenant())
    expect(result.current).toBe('acme')
  })

  it('prefers the route over the account, for a supergod visiting', () => {
    nav.useParams.mockReturnValue({ tenantSlug: 'acme' })
    auth.useAuthContext.mockReturnValue({ user: { tenantId: 'system' } })
    const { result } = renderHook(() => useRouteTenant())
    expect(result.current).toBe('acme')
  })

  it('is never the old shared "default" room', () => {
    const { result } = renderHook(() => useRouteTenant())
    expect(result.current).not.toBe('default')
  })
})
