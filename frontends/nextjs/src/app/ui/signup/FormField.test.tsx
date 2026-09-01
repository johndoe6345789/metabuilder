import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { FormField } from './FormField'

describe('FormField', () => {
  it('renders the label and current value', () => {
    render(
      <FormField
        label="Email"
        type="email"
        placeholder="you@example.com"
        value="alex@x.com"
        onChange={vi.fn()}
      />
    )
    expect(screen.getByText('Email')).toBeTruthy()
    expect(screen.getByDisplayValue('alex@x.com')).toBeTruthy()
  })

  it('calls onChange with the new value as the user types', () => {
    const onChange = vi.fn()
    render(
      <FormField
        label="Email"
        type="email"
        placeholder=""
        value=""
        onChange={onChange}
      />
    )
    fireEvent.change(screen.getByPlaceholderText(''), {
      target: { value: 'new@x.com' },
    })
    expect(onChange).toHaveBeenCalledWith('new@x.com')
  })

  it('renders optional hint content', () => {
    render(
      <FormField
        label="Password"
        type="password"
        placeholder=""
        value=""
        onChange={vi.fn()}
        hint={<span>Min 8 characters</span>}
      />
    )
    expect(screen.getByText('Min 8 characters')).toBeTruthy()
  })

  it('applies required, minLength and autoFocus to the input', () => {
    render(
      <FormField
        label="Username"
        type="text"
        placeholder=""
        value=""
        onChange={vi.fn()}
        required
        minLength={3}
        autoFocus
      />
    )
    const input = screen.getByPlaceholderText('') as HTMLInputElement
    expect(input.required).toBe(true)
    expect(input.minLength).toBe(3)
  })
})
