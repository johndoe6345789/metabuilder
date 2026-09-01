import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

const authContext = vi.hoisted(() => ({
  useAuthContext: vi.fn(() => ({
    user: {
      id: 'u1',
      username: 'alice',
      email: 'alice@example.com',
      role: 'admin',
      bio: 'hello there',
    },
  })),
}))
vi.mock('@/app/_components/auth-provider/auth-provider-component', () => authContext)

import { ProfileContent } from './ProfileContent'

describe('ProfileContent', () => {
  it('renders the username and email from the signed-in user', () => {
    render(<ProfileContent />)
    expect(screen.getByText('alice')).toBeTruthy()
    expect(screen.getByText(/alice@example\.com/)).toBeTruthy()
  })

  it('shows the correct access level for the role', () => {
    render(<ProfileContent />)
    expect(screen.getByText('Level 3')).toBeTruthy()
  })

  it('falls back to "User" and the default role level when signed out', () => {
    authContext.useAuthContext.mockReturnValueOnce({ user: null })
    render(<ProfileContent />)
    expect(screen.getByText('User')).toBeTruthy()
    expect(screen.getByText('Level 1')).toBeTruthy()
    expect(screen.getByText('No email on file')).toBeTruthy()
  })

  it('enters edit mode and shows Cancel/Save controls', () => {
    render(<ProfileContent />)
    fireEvent.click(screen.getByText('Edit Profile'))
    expect(screen.getByText('Cancel')).toBeTruthy()
    expect(screen.getByText('Save changes')).toBeTruthy()
  })

  it('returns to the read-only view when Cancel is clicked', () => {
    render(<ProfileContent />)
    fireEvent.click(screen.getByText('Edit Profile'))
    fireEvent.click(screen.getByText('Cancel'))
    expect(screen.getByText('Edit Profile')).toBeTruthy()
    expect(screen.queryByText('Cancel')).toBeNull()
  })
})
