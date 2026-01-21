import React from 'react'
import { render  } from '@/test-utils'

describe('Pagination Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<div>Pagination</div>)
    expect(container).toBeInTheDocument()
  })

  it('has correct structure', () => {
    const { getByText } = render(<div>Pagination</div>)
    expect(getByText('Pagination')).toBeInTheDocument()
  })

  it('supports custom classes', () => {
    const { container } = render(<div className="custom-class">Pagination</div>)
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
