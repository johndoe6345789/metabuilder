import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { PasswordField } from './PasswordField'

describe('PasswordField', () => {
  it.each([
    { label: 'Password', placeholder: undefined },
    { label: 'Enter Password', placeholder: 'Your password' },
    { label: 'Confirm Password', placeholder: 'Confirm your password' },
  ])('renders with label "$label" and placeholder "$placeholder"', ({ label, placeholder }) => {
    render(<PasswordField label={label} placeholder={placeholder} />)
    
    expect(screen.getByLabelText(label)).toBeTruthy()
    if (placeholder) {
      expect(screen.getByPlaceholderText(placeholder)).toBeTruthy()
    }
  })

  it('toggles password visibility when icon button is clicked', () => {
    render(<PasswordField />)
    
    const input = screen.getByLabelText('Password') as HTMLInputElement
    expect(input.type).toBe('password')
    
    const toggleButton = screen.getByLabelText('toggle password visibility')
    fireEvent.click(toggleButton)
    
    expect(input.type).toBe('text')
    
    fireEvent.click(toggleButton)
    expect(input.type).toBe('password')
  })

  it.each([
    { error: 'Password is required', helperText: undefined },
    { error: undefined, helperText: 'Must be at least 8 characters' },
    { error: 'Too short', helperText: 'Should be longer' },
  ])('displays error "$error" or helperText "$helperText"', ({ error, helperText }) => {
    render(<PasswordField error={error} helperText={helperText} />)
    
    const displayText = error || helperText
    if (displayText) {
      expect(screen.getByText(displayText)).toBeTruthy()
    }
  })

  it('calls onChange when value changes', () => {
    const handleChange = vi.fn()
    render(<PasswordField onChange={handleChange} />)
    
    const input = screen.getByLabelText('Password')
    fireEvent.change(input, { target: { value: 'newpassword' } })
    
    expect(handleChange).toHaveBeenCalled()
  })

  it('disables toggle button when field is disabled', () => {
    render(<PasswordField disabled />)
    
    const toggleButton = screen.getByLabelText('toggle password visibility')
    expect(toggleButton.hasAttribute('disabled')).toBe(true)
  })
})
