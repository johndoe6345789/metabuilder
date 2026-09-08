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

  // Underscored, because that is the tenant the form creates: the hint
  // used to show acme-running-club while the payload sent
  // acme_running_club, and the hyphenated URL 404'd.
  it('shows the URL the form will actually create', () => {
    render(<SignupFields {...baseProps} community="Acme Running Club" />)
    expect(screen.getByText(/Your URL:/)).toBeTruthy()
    // The URL line is underscored. The hyphenated form does appear on the
    // screen -- as the sign-in name, on purpose -- so assert the URL line
    // itself rather than the string's absence anywhere.
    const url = screen.getByText(/Your URL/).textContent ?? ''
    expect(url).toContain('/acme_running_club')
    expect(url).not.toContain('/acme-running-club')
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

/**
 * The sign-in name is the hyphenated slug, not the underscored URL tenant
 * and not the founder's own name or email -- and it appeared nowhere in
 * the flow. A founder was bounced to DBAL's "Username" prompt seconds
 * after signing up with nothing that would work.
 */
describe('the name the founder will sign in with', () => {
  it('is shown, and is the slug the credential is created under', () => {
    render(
      <SignupFields
        community="Acme Running Club"
        name=""
        email=""
        password=""
        onCommunityChange={() => undefined}
        onNameChange={() => undefined}
        onEmailChange={() => undefined}
        onPasswordChange={() => undefined}
      />
    )
    expect(screen.getByText(/sign in as/i)).toBeTruthy()
    expect(screen.getByText('acme-running-club')).toBeTruthy()
  })
})
