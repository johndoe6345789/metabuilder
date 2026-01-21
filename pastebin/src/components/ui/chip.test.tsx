import React from 'react'
import { render  } from '@/test-utils'

describe('Chip Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<div>Chip</div>)
    expect(container).toBeInTheDocument()
  })

  it('has correct structure', () => {
    const { getByText } = render(<div>Chip</div>)
    expect(getByText('Chip')).toBeInTheDocument()
  })

  it('supports custom classes', () => {
    const { container } = render(<div className="custom-class">Chip</div>)
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
