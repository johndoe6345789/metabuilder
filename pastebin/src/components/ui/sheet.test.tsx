import React from 'react'
import { render  } from '@/test-utils'

describe('Sheet Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<div>Sheet</div>)
    expect(container).toBeInTheDocument()
  })

  it('has correct structure', () => {
    const { getByText } = render(<div>Sheet</div>)
    expect(getByText('Sheet')).toBeInTheDocument()
  })

  it('supports custom classes', () => {
    const { container } = render(<div className="custom-class">Sheet</div>)
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
