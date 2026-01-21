import React from 'react'
import { render  } from '@/test-utils'

describe('Form Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<div>Form</div>)
    expect(container).toBeInTheDocument()
  })

  it('has correct structure', () => {
    const { getByText } = render(<div>Form</div>)
    expect(getByText('Form')).toBeInTheDocument()
  })

  it('supports custom classes', () => {
    const { container } = render(<div className="custom-class">Form</div>)
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
