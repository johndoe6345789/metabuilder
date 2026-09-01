import { describe, expect, it, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

const dbalSso = vi.hoisted(() => ({
  beginLogin: vi.fn(),
  friendlySignInError: vi.fn(),
}))
vi.mock('@metabuilder/dbal-sso/core', () => dbalSso)

import LoginPage from './page'

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the title, subtitle and links', () => {
    dbalSso.beginLogin.mockReturnValue(new Promise(() => {}))
    render(<LoginPage />)
    expect(screen.getByText('Sign in to MetaBuilder')).toBeTruthy()
    expect(
      screen.getByText('Continue with your MetaBuilder account')
    ).toBeTruthy()
    expect(screen.getByText('Create your community').closest('a')).toHaveProperty(
      'href',
      expect.stringContaining('/ui/signup')
    )
    expect(screen.getByText('← Back to home')).toHaveProperty(
      'href',
      expect.stringContaining('/')
    )
  })

  it('enters the loading state and calls beginLogin when Sign In is clicked', () => {
    dbalSso.beginLogin.mockReturnValue(new Promise(() => {}))
    render(<LoginPage />)
    const button = screen.getByRole('button', { name: 'Sign In' })
    fireEvent.click(button)
    expect(dbalSso.beginLogin).toHaveBeenCalledOnce()
    expect(screen.getByRole('button')).toHaveProperty('disabled', true)
    expect(screen.getByText('Redirecting…')).toBeTruthy()
  })

  it('stays in the loading state when beginLogin resolves', async () => {
    dbalSso.beginLogin.mockResolvedValue(undefined)
    render(<LoginPage />)
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }))
    await waitFor(() => {
      expect(screen.getByText('Redirecting…')).toBeTruthy()
    })
  })

  it('shows the friendly error and re-enables the button when beginLogin rejects', async () => {
    const failure = new Error('network down')
    dbalSso.beginLogin.mockRejectedValue(failure)
    dbalSso.friendlySignInError.mockReturnValue('Could not reach sign-in.')
    render(<LoginPage />)
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }))

    await waitFor(() => {
      expect(screen.getByText('Could not reach sign-in.')).toBeTruthy()
    })
    expect(dbalSso.friendlySignInError).toHaveBeenCalledWith(failure)
    const button = screen.getByRole('button', { name: 'Sign In' })
    expect(button).toHaveProperty('disabled', false)
  })
})
