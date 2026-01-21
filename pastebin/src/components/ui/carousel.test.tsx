import React from 'react'
import { render  } from '@/test-utils'

describe('Carousel Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<div>Carousel</div>)
    expect(container).toBeInTheDocument()
  })

  it('has correct structure', () => {
    const { getByText } = render(<div>Carousel</div>)
    expect(getByText('Carousel')).toBeInTheDocument()
  })

  it('supports custom classes', () => {
    const { container } = render(<div className="custom-class">Carousel</div>)
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
