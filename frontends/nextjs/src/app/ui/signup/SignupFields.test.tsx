import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { SignupFields } from './SignupFields'

const baseProps = {
  community: '',
  name: '',
  email: '',
  password: '',
  onCommunityChange: vi.fn(),
  onNameChange: vi.fn(),
  onEmailChange: vi.fn(),
  onPasswordChange: vi.fn(),
}

describe('SignupFields', () => {
  it('renders all four labelled fields', () => {
    render(<SignupFields {...baseProps} />)
    expect(screen.getByText('Community name')).toBeTruthy()
    expect(screen.getByText('Your name')).toBeTruthy()
    expect(screen.getByText('Email')).toBeTruthy()
    expect(screen.getByText('Password')).toBeTruthy()
  })

  it('shows no slug hint when the community name is one char or less', () => {
    render(<SignupFields {...baseProps} community="a" />)
    expect(screen.queryByText(/Your URL:/)).toBeNull()
  })

  it('shows a slugified URL hint once the community name is long enough', () => {
    render(<SignupFields {...baseProps} community="Acme Running Club" />)
    expect(screen.getByText(/Your URL:/)).toBeTruthy()
    expect(screen.getByText('acme-running-club')).toBeTruthy()
  })

  it('calls onCommunityChange when the community field changes', () => {
    const onCommunityChange = vi.fn()
    render(
      <SignupFields {...baseProps} onCommunityChange={onCommunityChange} />
    )
    fireEvent.change(screen.getByPlaceholderText('Acme Running Club'), {
      target: { value: 'New Club' },
    })
    expect(onCommunityChange).toHaveBeenCalledWith('New Club')
  })

  it('calls onPasswordChange when the password field changes', () => {
    const onPasswordChange = vi.fn()
    render(
      <SignupFields {...baseProps} onPasswordChange={onPasswordChange} />
    )
    fireEvent.change(screen.getByPlaceholderText('At least 8 characters'), {
      target: { value: 'supersecret' },
    })
    expect(onPasswordChange).toHaveBeenCalledWith('supersecret')
  })
})
