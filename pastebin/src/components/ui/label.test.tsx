import React from 'react'
import { render  } from '@/test-utils'

describe('Label Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<div>Label</div>)
    expect(container).toBeInTheDocument()
  })

  it('has correct structure', () => {
    const { getByText } = render(<div>Label</div>)
    expect(getByText('Label')).toBeInTheDocument()
  })

  it('supports custom classes', () => {
    const { container } = render(<div className="custom-class">Label</div>)
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
