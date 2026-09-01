import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PlanHeader } from './PlanHeader'

describe('PlanHeader', () => {
  it('renders the Plan title', () => {
    render(<PlanHeader count={3} />)
    expect(screen.getByText('Plan')).toBeTruthy()
  })

  it('shows the card count', () => {
    render(<PlanHeader count={3} />)
    expect(screen.getByText('3 cards')).toBeTruthy()
  })

  it('updates the count when it changes, including zero', () => {
    const { rerender } = render(<PlanHeader count={0} />)
    expect(screen.getByText('0 cards')).toBeTruthy()

    rerender(<PlanHeader count={1} />)
    expect(screen.getByText('1 cards')).toBeTruthy()
  })
})
