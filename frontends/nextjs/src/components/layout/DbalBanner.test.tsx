import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DbalBanner } from './DbalBanner'

describe('DbalBanner', () => {
  it('renders nothing when not visible', () => {
    const { container } = render(<DbalBanner visible={false} />)
    expect(container.firstChild).toBeNull()
  })

  it('shows the offline message when visible', () => {
    render(<DbalBanner visible />)
    expect(screen.getByText(/DBAL Offline/)).toBeTruthy()
  })
})
