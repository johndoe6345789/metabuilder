import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { ProfileFields } from './ProfileFields'

const baseProps = {
  username: 'alex',
  email: 'alex@x.com',
  bio: 'hello',
  status: 'idle' as const,
  onEmailChange: vi.fn(),
  onBioChange: vi.fn(),
}

describe('ProfileFields', () => {
  it('renders the username, email and bio values', () => {
    render(<ProfileFields {...baseProps} editing={false} />)
    expect(screen.getByDisplayValue('alex')).toBeTruthy()
    expect(screen.getByDisplayValue('alex@x.com')).toBeTruthy()
    expect(screen.getByDisplayValue('hello')).toBeTruthy()
  })

  it('disables email and bio when not editing, but never the username', () => {
    render(<ProfileFields {...baseProps} editing={false} />)
    expect(screen.getByDisplayValue('alex').closest('input')?.disabled).toBe(
      true
    )
    expect(
      screen.getByDisplayValue('alex@x.com').closest('input')?.disabled
    ).toBe(true)
  })

  it('enables email and bio while editing', () => {
    render(<ProfileFields {...baseProps} editing />)
    expect(
      screen.getByDisplayValue('alex@x.com').closest('input')?.disabled
    ).toBe(false)
    expect(screen.getByDisplayValue('hello').closest('textarea')?.disabled).toBe(
      false
    )
  })

  it('calls onEmailChange and onBioChange as the user types', () => {
    const onEmailChange = vi.fn()
    const onBioChange = vi.fn()
    render(
      <ProfileFields
        {...baseProps}
        editing
        onEmailChange={onEmailChange}
        onBioChange={onBioChange}
      />
    )
    fireEvent.change(screen.getByDisplayValue('alex@x.com'), {
      target: { value: 'new@x.com' },
    })
    fireEvent.change(screen.getByDisplayValue('hello'), {
      target: { value: 'updated bio' },
    })
    expect(onEmailChange).toHaveBeenCalledWith('new@x.com')
    expect(onBioChange).toHaveBeenCalledWith('updated bio')
  })
})
