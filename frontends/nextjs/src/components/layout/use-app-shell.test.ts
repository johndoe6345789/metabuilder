import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'

const identity = vi.hoisted(() => ({
  useShellIdentity: vi.fn(() => ({
    auth: {
      isAuthenticated: true,
      logout: vi.fn().mockResolvedValue(undefined),
    },
    userLevel: 3,
    username: 'alex',
    role: 'admin',
    tenantId: 'acme',
  })),
}))
const shellData = vi.hoisted(() => ({
  fetchDbalHealth: vi.fn().mockResolvedValue(false),
  fetchNavigablePackages: vi.fn().mockResolvedValue([]),
}))
const narrow = vi.hoisted(() => ({
  useNarrowViewport: vi.fn(),
  isNarrowViewport: vi.fn(() => false),
}))
const nav = vi.hoisted(() => ({ push: vi.fn() }))

vi.mock('./use-shell-identity', () => identity)
vi.mock('./app-shell-data', () => shellData)
vi.mock('./use-narrow-viewport', () => narrow)
vi.mock('next/navigation', () => ({ useRouter: () => nav }))

import { useAppShell } from './use-app-shell'

beforeEach(() => {
  vi.clearAllMocks()
  identity.useShellIdentity.mockReturnValue({
    auth: {
      isAuthenticated: true,
      logout: vi.fn().mockResolvedValue(undefined),
    },
    userLevel: 3,
    username: 'alex',
    role: 'admin',
    tenantId: 'acme',
  })
  shellData.fetchDbalHealth.mockResolvedValue(false)
  shellData.fetchNavigablePackages.mockResolvedValue([])
  narrow.isNarrowViewport.mockReturnValue(false)
})

describe('useAppShell', () => {
  it('loads DBAL health and navigable packages on mount', async () => {
    shellData.fetchDbalHealth.mockResolvedValue(true)
    shellData.fetchNavigablePackages.mockResolvedValue([
      { id: 'p1', label: 'Pkg' },
    ])
    const { result } = renderHook(() => useAppShell())

    await waitFor(() => expect(result.current.dbalOffline).toBe(true))
    expect(result.current.packages).toEqual([{ id: 'p1', label: 'Pkg' }])
  })

  it('shows the sidebar only when authenticated and open', () => {
    const { result } = renderHook(() => useAppShell())
    expect(result.current.showSidebar).toBe(false)

    act(() => result.current.toggleSidebar())
    expect(result.current.showSidebar).toBe(true)
  })

  it('never shows the sidebar when signed out, even if toggled open', () => {
    identity.useShellIdentity.mockReturnValue({
      auth: { isAuthenticated: false, logout: vi.fn() },
      userLevel: 0,
      username: 'User',
      role: 'public',
      tenantId: 'system',
    })
    const { result } = renderHook(() => useAppShell())
    act(() => result.current.toggleSidebar())
    expect(result.current.showSidebar).toBe(false)
  })

  it('toggleSidebar flips the open state back and forth', () => {
    const { result } = renderHook(() => useAppShell())
    act(() => result.current.toggleSidebar())
    act(() => result.current.toggleSidebar())
    expect(result.current.showSidebar).toBe(false)
  })

  it('navigate closes the sidebar on a narrow viewport', () => {
    narrow.isNarrowViewport.mockReturnValue(true)
    const { result } = renderHook(() => useAppShell())
    act(() => result.current.toggleSidebar())
    expect(result.current.showSidebar).toBe(true)

    act(() => result.current.navigate())
    expect(result.current.showSidebar).toBe(false)
  })

  it('navigate leaves the sidebar alone on a wide viewport', () => {
    narrow.isNarrowViewport.mockReturnValue(false)
    const { result } = renderHook(() => useAppShell())
    act(() => result.current.toggleSidebar())

    act(() => result.current.navigate())
    expect(result.current.showSidebar).toBe(true)
  })

  it('logout signs out and redirects home', async () => {
    const logout = vi.fn().mockResolvedValue(undefined)
    identity.useShellIdentity.mockReturnValue({
      auth: { isAuthenticated: true, logout },
      userLevel: 3,
      username: 'alex',
      role: 'admin',
      tenantId: 'acme',
    })
    const { result } = renderHook(() => useAppShell())

    await act(async () => {
      await result.current.logout()
    })

    expect(logout).toHaveBeenCalledOnce()
    expect(nav.push).toHaveBeenCalledWith('/')
  })

  it('spreads the identity fields through onto the returned state', () => {
    const { result } = renderHook(() => useAppShell())
    expect(result.current.username).toBe('alex')
    expect(result.current.role).toBe('admin')
    expect(result.current.tenantId).toBe('acme')
  })
})
