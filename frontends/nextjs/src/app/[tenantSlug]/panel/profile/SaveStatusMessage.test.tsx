import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SaveStatusMessage } from './SaveStatusMessage'

describe('SaveStatusMessage', () => {
  it('renders nothing while idle', () => {
    const { container } = render(<SaveStatusMessage status="idle" />)
    expect(container.firstChild).toBeNull()
  })

  it('shows a success message', () => {
    render(<SaveStatusMessage status="success" />)
    expect(
      screen.getByText('Profile saved successfully.')
    ).toBeTruthy()
  })

  it('shows an error message', () => {
    render(<SaveStatusMessage status="error" />)
    expect(
      screen.getByText('Failed to save profile. Please try again.')
    ).toBeTruthy()
  })
})
