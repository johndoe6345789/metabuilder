import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EntityLoadError } from './EntityLoadError'

describe('EntityLoadError', () => {
  it('renders the given error message', () => {
    render(<EntityLoadError message="Entity not found" />)
    expect(
      screen.getByText('Error loading data: Entity not found')
    ).toBeTruthy()
  })

  it('renders a different message correctly', () => {
    render(<EntityLoadError message="Network timeout" />)
    expect(
      screen.getByText('Error loading data: Network timeout')
    ).toBeTruthy()
    expect(screen.queryByText(/Entity not found/)).toBeNull()
  })
})
