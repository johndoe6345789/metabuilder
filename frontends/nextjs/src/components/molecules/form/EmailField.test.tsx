import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { EmailField } from './EmailField'

describe('EmailField', () => {
  it.each([
    { label: 'Email', placeholder: 'you@example.com', showIcon: true },
    { label: 'Your Email', placeholder: 'Enter email', showIcon: false },
    { label: 'Work Email', placeholder: undefined, showIcon: true },
  ])(
    'renders with label "$label", placeholder "$placeholder", showIcon $showIcon',
    ({ label, placeholder, showIcon }) => {
      render(<EmailField label={label} placeholder={placeholder} showIcon={showIcon} />)

      expect(screen.getByLabelText(label)).toBeTruthy()
      if (placeholder) {
        expect(screen.getByPlaceholderText(placeholder)).toBeTruthy()
      }
    }
  )

  it('renders with email icon by default', () => {
    const { container } = render(<EmailField />)

    // Icon is rendered via MUI Icon component
    expect(container.querySelector('svg')).toBeTruthy()
  })

  it('does not render icon when showIcon is false', () => {
    const { container } = render(<EmailField showIcon={false} />)

    // No icon should be present
    expect(container.querySelector('svg')).toBeNull()
  })

  it.each([
    { error: 'Invalid email', helperText: undefined },
    { error: undefined, helperText: 'Enter a valid email address' },
    { error: 'Required field', helperText: 'Please provide your email' },
  ])('displays error "$error" or helperText "$helperText"', ({ error, helperText }) => {
    render(<EmailField error={error} helperText={helperText} />)

    const displayText = error || helperText
    if (displayText) {
      expect(screen.getByText(displayText)).toBeTruthy()
    }
  })

  it('calls onChange when value changes', () => {
    const handleChange = vi.fn()
    render(<EmailField onChange={handleChange} />)

    const input = screen.getByLabelText('Email')
    fireEvent.change(input, { target: { value: 'test@example.com' } })

    expect(handleChange).toHaveBeenCalled()
  })

  it('has type="email" attribute', () => {
    render(<EmailField />)

    const input = screen.getByLabelText('Email') as HTMLInputElement
    expect(input.type).toBe('email')
  })
})
