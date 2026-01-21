import React from 'react'
import { render  } from '@/test-utils'

describe('Chart Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<div>Chart</div>)
    expect(container).toBeInTheDocument()
  })

  it('has correct structure', () => {
    const { getByText } = render(<div>Chart</div>)
    expect(getByText('Chart')).toBeInTheDocument()
  })

  it('supports custom classes', () => {
    const { container } = render(<div className="custom-class">Chart</div>)
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
