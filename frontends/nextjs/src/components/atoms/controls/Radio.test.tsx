import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Radio } from './Radio'

describe('Radio', () => {
  it.each([
    { label: 'Option A', value: 'a' },
    { label: 'Option B', value: 'b' },
    { label: undefined, value: 'c' },
  ])('renders with props %o', ({ label, value }) => {
    render(<Radio label={label} value={value} />)
    const radio = screen.getByRole('radio')
    expect(radio).not.toBeNull()
    if (label) {
      expect(screen.getByText(label)).not.toBeNull()
    }
  })

  it('renders checked state', () => {
    render(<Radio label="Selected" checked onChange={() => {}} />)
    const radio = screen.getByRole('radio') as HTMLInputElement
    expect(radio.checked).toBe(true)
  })

  it('renders disabled state', () => {
    render(<Radio label="Disabled" disabled />)
    const radio = screen.getByRole('radio') as HTMLInputElement
    expect(radio.disabled).toBe(true)
  })
})
