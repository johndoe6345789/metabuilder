import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

const godUsersHook = vi.hoisted(() => ({
  useGodUsers: vi.fn(() => [
    { id: '1', username: 'god', email: 'god@x.com', role: 'god' },
    { id: '2', username: 'super', email: 'super@x.com', role: 'supergod' },
  ]),
}))
vi.mock('./god-users/use-god-users', () => godUsersHook)

import { GodUsersTab } from './GodUsersTab'

describe('GodUsersTab', () => {
  it('renders the heading', () => {
    render(<GodUsersTab />)
    expect(screen.getByText('God-Level Users')).toBeTruthy()
  })

  it('renders a row per god user from the hook', () => {
    render(<GodUsersTab />)
    expect(screen.getByText('god@x.com')).toBeTruthy()
    expect(screen.getByText('super@x.com')).toBeTruthy()
  })

  it('renders nothing extra when there are no god users', () => {
    godUsersHook.useGodUsers.mockReturnValue([])
    render(<GodUsersTab />)
    expect(screen.getByText('God-Level Users')).toBeTruthy()
    expect(screen.queryByText('god@x.com')).toBeNull()
  })
})
