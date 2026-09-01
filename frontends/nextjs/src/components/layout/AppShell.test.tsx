import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

const themeHook = vi.hoisted(() => ({
  useTheme: vi.fn(() => ({ toggleTheme: vi.fn(), resolvedMode: 'light' })),
}))
vi.mock('@/app/providers', () => themeHook)

const shellHook = vi.hoisted(() => ({ useAppShell: vi.fn() }))
vi.mock('./use-app-shell', () => shellHook)

interface AppBarMockProps {
  username: string | null
  onLogout: () => void
  onToggleTheme?: () => void
}
const appBar = vi.hoisted(() => ({
  AppBarComponent: vi.fn((props: AppBarMockProps) => (
    <div data-testid="app-bar">{props.username}</div>
  )),
}))
vi.mock('./AppBar', () => appBar)

vi.mock('./DbalBanner', () => ({
  DbalBanner: vi.fn(({ visible }: { visible: boolean }) =>
    visible ? <div data-testid="dbal-banner" /> : null
  ),
}))
vi.mock('@/components/PackageStyleLoader', () => ({
  PackageStyleLoader: vi.fn(() => null),
}))
vi.mock('./ShellSidebarSlot', () => ({
  ShellSidebarSlot: vi.fn(() => <div data-testid="sidebar-slot" />),
}))

import { AppShell } from './AppShell'

function shell(over: Record<string, unknown> = {}) {
  return {
    showSidebar: false, userLevel: 1, username: 'alice', role: 'user',
    tenantId: 'acme', auth: { isAuthenticated: true }, dbalOffline: false,
    packages: [], toggleSidebar: vi.fn(), navigate: vi.fn(),
    logout: vi.fn(async () => undefined), ...over,
  }
}

// A fresh element per call -- a shared one makes React bail out early.
const page = () => (
  <AppShell>
    <p>content</p>
  </AppShell>
)

describe('AppShell', () => {
  it('renders the app bar and children; toggles the DBAL banner', () => {
    shellHook.useAppShell.mockReturnValue(shell())
    const { rerender } = render(page())
    expect(screen.getByTestId('app-bar').textContent).toBe('alice')
    expect(screen.getByText('content')).toBeTruthy()
    expect(screen.queryByTestId('dbal-banner')).toBeNull()

    shellHook.useAppShell.mockReturnValue(shell({ dbalOffline: true }))
    rerender(page())
    expect(screen.getByTestId('dbal-banner')).toBeTruthy()
  })

  it('adds the sidebarOpen class only when the sidebar is shown', () => {
    shellHook.useAppShell.mockReturnValue(shell({ showSidebar: false }))
    const { container, rerender } = render(page())
    const cls = () => container.firstElementChild?.className
    expect(cls()).not.toContain('sidebarOpen')

    shellHook.useAppShell.mockReturnValue(shell({ showSidebar: true }))
    rerender(page())
    expect(cls()).toContain('sidebarOpen')
  })

  it('calls logout when onLogout fires from the app bar', () => {
    const logout = vi.fn(async () => undefined)
    shellHook.useAppShell.mockReturnValue(shell({ logout }))
    render(page())
    appBar.AppBarComponent.mock.calls.at(-1)?.[0]?.onLogout()
    expect(logout).toHaveBeenCalledOnce()
  })

  it('calls toggleTheme when onToggleTheme fires from the app bar', () => {
    const toggleTheme = vi.fn()
    shellHook.useAppShell.mockReturnValue(shell())
    themeHook.useTheme.mockReturnValueOnce({ toggleTheme, resolvedMode: 'dark' })
    render(page())
    appBar.AppBarComponent.mock.calls.at(-1)?.[0]?.onToggleTheme?.()
    expect(toggleTheme).toHaveBeenCalledOnce()
  })
})
