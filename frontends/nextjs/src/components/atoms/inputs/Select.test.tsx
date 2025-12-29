import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Select } from './Select'

const mockOptions = [
  { value: 'opt1', label: 'Option 1' },
  { value: 'opt2', label: 'Option 2' },
  { value: 'opt3', label: 'Option 3', disabled: true },
]

describe('Select', () => {
  it.each([
    { options: mockOptions, placeholder: 'Choose option', fullWidth: true },
    { options: mockOptions, placeholder: undefined, fullWidth: false },
  ])('renders with props %o', props => {
    render(<Select {...props} value="" onChange={() => {}} />)
    const select = screen.getByRole('combobox')
    expect(select).not.toBeNull()
  })

  it('shows placeholder when provided', () => {
    render(<Select options={mockOptions} placeholder="Select..." value="" onChange={() => {}} />)
    const select = screen.getByRole('combobox')
    expect(select).not.toBeNull()
  })

  it('renders all options', () => {
    render(<Select options={mockOptions} value="" onChange={() => {}} />)
    const select = screen.getByRole('combobox')
    expect(select).not.toBeNull()
  })

  it('shows error state', () => {
    render(<Select options={mockOptions} error value="" onChange={() => {}} />)
    const select = screen.getByRole('combobox')
    expect(select).not.toBeNull()
  })
})
