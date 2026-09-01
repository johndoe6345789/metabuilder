import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

const authHook = vi.hoisted(() => ({
  useAuthContext: vi.fn(() => ({
    user: { username: 'alex', email: 'alex@x.com', role: 'admin' },
    logout: vi.fn(),
  })),
}))
vi.mock('@/app/_components/auth-provider/auth-provider-component', () => authHook)

import { AccountPanel } from './AccountPanel'

describe('AccountPanel', () => {
  it('shows the username, email and role from auth context', () => {
    render(<AccountPanel />)
    expect(screen.getByText('alex')).toBeTruthy()
    expect(screen.getByText('alex@x.com')).toBeTruthy()
    expect(screen.getByText('admin')).toBeTruthy()
  })

  it('falls back to N/A and user role when there is no user', () => {
    authHook.useAuthContext.mockReturnValue({ user: null, logout: vi.fn() })
    render(<AccountPanel />)
    expect(screen.getAllByText('N/A')).toHaveLength(2)
    expect(screen.getByText('user')).toBeTruthy()
  })

  it('calls logout when Sign Out is clicked', () => {
    const logout = vi.fn().mockResolvedValue(undefined)
    authHook.useAuthContext.mockReturnValue({
      user: { username: 'alex', email: 'alex@x.com', role: 'admin' },
      logout,
    })
    render(<AccountPanel />)
    fireEvent.click(screen.getByText('Sign Out'))
    expect(logout).toHaveBeenCalledOnce()
  })
})
