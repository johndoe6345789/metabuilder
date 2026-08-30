import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { TimeHeader } from './TimeHeader'

describe('TimeHeader', () => {
  it('renders a label for every slot', () => {
    const slots = [
      new Date('2026-01-01T10:00:00'),
      new Date('2026-01-01T10:30:00'),
    ]
    render(<TimeHeader slots={slots} />)
    expect(screen.getAllByText(/10:/).length).toBe(2)
  })

  it('renders nothing when there are no slots', () => {
    const { container } = render(<TimeHeader slots={[]} />)
    expect(container.querySelectorAll('span').length).toBe(0)
  })
})
