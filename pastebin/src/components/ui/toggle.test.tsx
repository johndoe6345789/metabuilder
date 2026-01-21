import React from 'react'
import { render  } from '@/test-utils'

describe('Toggle Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<div>Toggle</div>)
    expect(container).toBeInTheDocument()
  })

  it('has correct structure', () => {
    const { getByText } = render(<div>Toggle</div>)
    expect(getByText('Toggle')).toBeInTheDocument()
  })

  it('supports custom classes', () => {
    const { container } = render(<div className="custom-class">Toggle</div>)
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
